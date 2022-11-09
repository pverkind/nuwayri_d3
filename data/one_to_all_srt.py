"""Combine all text reuse data of one text related to all other
texts in the corpus.

NOTE: the script does not aggregate character matches + percentages
if there are two alignments between the same pair of milestones!

Output can be in three formats:
* one csv file:
  - filename: <OpenITIversion>_<versionID>_all.csv
  - columns:
      * ms1: milestone number of the alginment in book 1 (= the main book)
      * b1: character offset of the start of the alignment in ms1
      * e1: character offset of the end of the alignment in ms1
      * id2: version id of book 2 (without language and extension)
      * ms2: milestone number of the alignment in book 2
      * b2: character offset of the start of the alignment in ms2
      * e2: character offset of the end of the alignment in ms2
      * ch_match: number of characters matched
      * matches_percent: percentage of the milestone matched

* one json file:
  - filename: <OpenITIversion>_<versionID>_all.json
  - structure:
    {ms1: [  # milestone number of the alginment in book 1 (= the main book)
      {
        "b1": int,  # character offset of the start of the alignment in ms1
        "e1": int,  # character offset of the end of the alignment in ms1
        "id2": str, # version id of book 2 (without language and extension)
        "ms2": int, # milestone number of the alignment in book 1
        "b2": int,  # character offset of the start of the alignment in ms2
        "e2": int,  # character offset of the end of the alignment in ms2
        "ch_match": int,  # number of characters matched
        "matches_percent": int  # percentage of the milestone matched
      }
    ]}
* one json file for each milestone for which matches were recorded:
  - filename: <OpenITIversion>_<versionID>_ms<milestoneNumber>.json
  - structure:
    {
      "data": [  
        {
          "b1": int,  # character offset of the start of the alignment in ms1
          "e1": int,  # character offset of the end of the alignment in ms1
          "id2": str, # version id of book 2 (without language and extension)
          "ms2": int, # milestone number of the alignment in book 1
          "b2": int,  # character offset of the start of the alignment in ms2
          "e2": int,  # character offset of the end of the alignment in ms2
          "ch_match": int,  # number of characters matched
          "matches_percent": int  # percentage of the milestone matched
        }
      ]
    }

In addition, stats on the number of alignments and characters matched
are created for each book, either in json or csv format:

* csv file: 
  - file name: <OpenITIversion>_<versionID>_stats.csv
  - columns:
      - "id": version id (without language and extension) of the compared book
      - "book": book URI connected to the version id
      - "alignments": number of alignments with this book
      - "ch_match": total number of characters matched with this book
* json file:
  - file name: <versionID>_stats.json
  - structure:
    {
      "stats": [
        {
          "id": str,
          "alignments": int,
          "ch_match": int
        }
      ]
    }
"""


from collections import defaultdict
import os
import json
import re
import csv
import time
import requests

def load_metadata(meta_fp="OpenITI_metadata_2021-1-4_merged.txt"):
    with open(meta_fp, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter="\t")
        meta = {row["id"]: {"status": row["status"],\
                            "date": int(row["date"]),\
                            "author": row["author_lat"],\
                            "book": row["book"]} for row in reader}
    return meta

def download_file(url, filepath):
    """
    Write the download to file in chunks,
    so that the download does not fill up the memory.
    See http://stackoverflow.com/a/16696317/4045481
    """
    r = requests.get(url, stream=True)
    with open(filepath, "wb") as f:
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)

def download_srt_files(base_url, main_text_id, outfolder, incl_sec=False):
    print("Downloading srt files to", outfolder)
    if not os.path.exists(outfolder):
        os.mkdir(outfolder)
    if not base_url.endswith("/"):
        base_url += "/"
    base_url += main_text_id + "/"
    r = requests.get(base_url)
    links = re.findall('<a href="([^"]{10,})"', r.text)
    number_of_links = len(links)
    print(number_of_links, "LINKS DOWNLOAD STARTED")
    for i, link in enumerate(links):
        print(link)
        outfp = os.path.join(outfolder, link)
        if not os.path.exists(outfp):
            if incl_sec:
                print("    downloading (pri and sec)")
                download_file(base_url+link, outfp)
            else:
                text_ids = re.sub("(?:\.csv|\.txt|\.gz)*$", "", link)
                text_ids = text_ids.split("_")
                for t in text_ids:
                    if main_text_id not in t:
                        sec_text_id = t.split("-")[0]
                print(sec_text_id)
                if sec_text_id in meta:
                    if meta[sec_text_id]["status"] == "pri":
                        print("    downloading", i, "of", number_of_links)
                        download_file(base_url+link, outfp)
                    else:
                        print("    excluding from download: not a primary file")
                else:
                    print(sec_text_id, "not in metadata. Aborting download")
        else:
            print("    already in folder")


def extract_milestone_data_from_file(file, ms_data, main, comp,
                                     main_col, comp_col):
    """"Extract start and end of each reused milestone

    Args:
        file (file object)
        ms_data (defaultdict): contains for each milestone in the `main` text
            a dictionary of other texts in which this milestone is reused:
            ms_data[main_ms][comp][comp_ms][comp_bw] = {"comp_bw":, "comp_ew":, "comp_s":,
                                                        "main_bw":, "main_ew":, "main_s":
                                                        }
        main (str): id of the main book (derived from the srt file name).
        comp (str): id of the compared book (derived from the srt file name).
        main_col (str): is the main book bk1 or bk2 in the srt file? "1" or "2".
        comp_col (str): is the compared book bk1 or bk2 in the srt file? "1" or "2". 
    """
    for row in csv.DictReader(file, delimiter="\t"):
        main_ms = int(re.findall(r"\d+$", row["id"+main_col])[0])
        main_b = int(row["b"+main_col])
        main_e = int(row["e"+main_col])
        comp_ms = int(re.findall(r"\d+$", row["id"+comp_col])[0])
        comp_b = int(row["b"+comp_col])
        comp_e = int(row["e"+comp_col])
        ch_match = int(row["ch_match"])
        matches_percent = int(float(row["matches_percent"]))
##        if not comp in ms_data[main_ms]:
##            ms_data[main_ms][comp] = defaultdict(dict)
##        if not comp_ms in ms_data[main_ms][comp]: 
##            ms_data[main_ms][comp][comp_ms] = defaultdict(dict)
##        ms_data[main_ms][comp][comp_ms][comp_b]["b2"] = comp_b
##        ms_data[main_ms][comp][comp_ms][comp_b]["e2"] = comp_e
##        ms_data[main_ms][comp][comp_ms][comp_b]["b1"] = main_b
##        ms_data[main_ms][comp][comp_ms][comp_b]["e1"] = main_e
##        ms_data[main_ms][comp][comp_ms][comp_b]["ch_match"] = ch_match
        ms_data[main_ms].append({"b1": main_b, "e1": main_e,
                                 "id2": comp, "ms2": comp_ms,
                                 "b2": comp_b, "e2": comp_e,
                                 "ch_match": ch_match,
                                 "matches_percent": matches_percent})
  
def compute_stats(ms_data, meta):
    """Compute reuse statistics for each book

    Args:
        ms_data (dict): reuse data, organized by milestone number
            of the main book

    Returns:
        dict
    """
    stats = dict()
    for ms1, reuse in ms_data.items():
        for d in reuse:
            id2 = d["id2"]
            if not id2 in stats:
                stats[id2] = {"alignments": 0, "ch_match": 0, "book": meta[id2]["book"]}
            stats[id2]["alignments"] += 1
            stats[id2]["ch_match"] += d["ch_match"]
    return stats


def extract_milestone_data_from_folder(folder, outfolder, openiti_version, meta,
                                       single_json=True, csv_output=True,
                                       indent=None, verbose=True):
    """Extract for every milestone in the main text all corresponding
    milestones from all csv files in `folder` and save them as json file(s)

    Args:
        folder (str): path to the folder containing the srt files
        outfolder (str): path to the output folder
        openiti_version (str): number of the OpenITI corpus version
            related to this passim run
            (<year>.<nth_run_this_year>.<nth_run_in_total>, e.g., 2021.2.5)
        single_json (bool): if True, all milestone data will be in
            a single json file; if False, one json file will be
            created for each milestone
        indent (int): number of spaces by which the json output
            will be indented (0 = no spaces, but each key-value pair
            on a new line). Defaults to None (no indentation nor new lines)
        csv_output (bool): if True, csv output will be created rather than json
        verbose (bool): if True, srt file names will be printed out
            as they are being processed
    """
    # define which book is the main book by checking all csv filenames:
    count = defaultdict(int)
    for fn in os.listdir(folder):
        if not fn.endswith(("json", "_all.csv", "_stats.csv")):
            bk1, bk2 = ".".join(fn.split(".")[:-1]).split("_")
            count[bk1] += 1
            count[bk2] += 1
    
    main = sorted(count.items(), key=lambda item: item[1], reverse=True)[0][0]
    # NB: main is the version ID + extension!
    main = main.split("-")[0]

##    ms_data = defaultdict(dict)
    ms_data = defaultdict(list)
    for fn in os.listdir(folder):
        if not fn.endswith(("json", "_all.csv", "_stats.csv")):
            if verbose:
                print(fn)
            fp = os.path.join(folder, fn)
            bk1, bk2 = ".".join(fn.split(".")[:-1]).split("_")
            bk1 = bk1.split("-")[0]
            bk2 = bk2.split("-")[0]
            if bk1 == main:
                comp = bk2
                main_col = "1"
                comp_col = "2"
            else:
                comp = bk1
                main_col = "2"
                comp_col = "1"
                
            if not fp.endswith("gz"):
                with open(fp, mode="r", encoding="utf-8") as file:
                    extract_milestone_data_from_file(file, ms_data, main, comp,
                                                     main_col, comp_col)
            else:
                with gzip.open(fp, mode="rt", encoding="utf-8") as file:
                    extract_milestone_data_from_file(file, ms_data, main, comp,
                                                     main_col, comp_col)
                
            #print(json.dumps(ms_data, ensure_ascii=False, indent=2, sort_keys=True))

    # compute statistics: how many alignments, how many characters matched
    # for every book2:
    stats = compute_stats(ms_data, meta)
    

    # Create output:
    if csv_output:
        outfp = os.path.join(outfolder, "{}_{}_all.csv".format(openiti_version, main))
        rows = ["ms1,b1,e1,id2,ms2,b2,e2,ch_match,matches_percent",]
        for ms1 in sorted(ms_data.keys()):
            for d in ms_data[ms1]:
                row = [ms1, d["b1"], d["e1"], d["id2"], d["ms2"],
                       d["b2"], d["e2"], d["ch_match"], d["matches_percent"]]
                rows.append(",".join([str(x) for x in row]))
##            for id2 in ms_data[ms1]:
##                for ms2 in ms_data[ms1][id2]:
##                    for b2, d in ms_data[ms1][id2][ms2].items():
##                        row = [ms1, d["b1"], d["e1"], id2, ms2, b2, d["e2"], d["ch_match"]]
##                        rows.append(",".join([str(x) for x in row]))
        with open(outfp, mode="w", encoding="utf-8") as file:
            file.write("\n".join(rows))
            
        stats_fp = os.path.join(outfolder, "{}_{}_stats.csv".format(openiti_version, main))
        with open(stats_fp, mode="w", encoding="utf-8") as file:
            csv_stats = [[id2, d["book"], str(d["alignments"]), str(d["ch_match"])] for id2, d in stats.items()]
            csv_stats = [",".join(row) for row in sorted(csv_stats)]
            file.write("id,book,alignments,ch_match\n" + "\n".join(csv_stats))
    else:
        if single_json:
            outfp = os.path.join(outfolder, "{}_{}_all.json".format(openiti_version, main))
            with open(outfp, mode="w", encoding="utf-8") as file:
                json.dump(ms_data, file, sort_keys=True, indent=indent)
        else:
            for ms in ms_data:
                outfp = os.path.join(outfolder, "{}_{}_ms{}.json".format(openiti_version, main, ms))
                with open(outfp, mode="w", encoding="utf-8") as file:
                    json.dump({"data": ms_data[ms]}, file,
                              sort_keys=True, indent=indent)
        stats_fp = os.path.join(outfolder, "{}_{}_stats.json".format(openiti_version, main))
        with open(stats_fp, mode="w", encoding="utf-8") as file:
            stats = [{"id": id2, "alignments": d["alignments"],
                      "ch_match": d["ch_match"], "matches_percent": d["matches_percent"]}\
                     for id2,d in stats.items()]
            json.dump({"stats": stats}, file, sort_keys=True, indent=indent)

    return ms_data


meta_fp = r"D:\London\OpenITI\visualization\Nuwayri\powerBI\Metadata\OpenITI_metadata_2021-2-5_merged.txt"
meta = load_metadata(meta_fp)

##base_url = "http://dev.kitab-project.org/passim01102021"
##main_text_id = "Shamela0010283-ara1.mARkdown"
##srt_folder = r"D:\London\OpenITI\visualization\Nuwayri\powerBI\Nuwayri_csvs_2021_2_5"
##download_srt_files(base_url, main_text_id, srt_folder)

openiti_version = "2021.2.5"
srt_folder = r"D:\London\publications\co-authored vol\geographers_srts_2019\0346Istakhri.MasalikWaMamalik"
outfolder = r"D:\London\OpenITI\visualization\Nuwayri\test"
start = time.time()


srt_folder= r"D:\London\publications\co-authored vol\geographers_srts_2019\0310Tabari.Tarikh"
soutfolder = "."

extract_milestone_data_from_folder(srt_folder, outfolder, openiti_version, meta,
                                   single_json=True, csv_output=True,
                                   verbose=False, indent=0)
end = time.time()

print("extracting data took", end-start, "seconds")
