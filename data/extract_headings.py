import re
from collections import defaultdict
from copy import deepcopy


def section_headings_by_milestone(fp, outfp):
    """Get the starting milestone of each section header,\
    And save all of them in csv format: level,ms,header
    """
    headings = []
    with open(fp, mode="r", encoding="utf-8") as file:
        current_ms = 1
        for line in file.readlines():
            for level, heading in re.findall("### (\|+) (.+)", line):
                heading = re.sub(" *ms\d+ *| *«\d+» *", " ", heading)
                headings.append( [len(level), current_ms, heading.strip()] )
                #print(headings[-1])
            for ms in re.findall("ms(\d+)", line):
                current_ms = int(ms)
    with open(outfp, mode="w", encoding="utf-8") as file:
        headings_csv = ["{},{},{}".format(*h) for h in headings]
        file.write("\n".join(["level,ms,header", ] + headings_csv))
    return headings, current_ms

def identify_section_endings(headings, last_ms, outfp):
    """Get the ending milestone of each section,\
    And save all of them in csv format: level,start_ms,header,end_ms

    Args:
        headings (list): a list of three-item lists (level,ms,header),
            created by the section_headings_by_milestone function
        last_ms (int): number of the last milestone in the text
            (also an output of the section_headings_by_milestone function)
        outfp (str): path for the final csv file
    """
    open_levels = dict()  # key: level, value: index in headings
    for i in range(len(headings)):
        level, ms, heading = headings[i]
        for open_level, open_level_index in deepcopy(open_levels).items():
            # the current heading closes off all open lower-level headings
            if open_level >= level:
                headings[open_level_index].append(ms)
                del open_levels[open_level]
        open_levels[level] = i
        
    for open_level, index in deepcopy(open_levels).items():
        headings[index].append(ms)
        del open_levels[open_level]

    with open(outfp, mode="w", encoding="utf-8") as file:
        headings_csv = ["{},{},{},{}".format(*tup) for tup in headings]
        file.write("\n".join(["level,start_ms,header,end_ms", ] + headings_csv))
                
                
        
                    

if __name__ == "__main__":
    fp = r"D:\London\OpenITI\25Y_repos\0750AH\data\0733Nuwayri\0733Nuwayri.NihayatArab\0733Nuwayri.NihayatArab.Shamela0010283-ara1.mARkdown"
    outfp = r"D:\London\OpenITI\visualization\Nuwayri\nuwayri_d3\data\2021.2.5_Shamela0010283_sections.csv"
    #headings, last_ms = section_headings_by_milestone(fp, outfp)
    #identify_section_endings(headings, last_ms, outfp)
    
    fp = r"D:\London\OpenITI\25Y_repos\0350AH\data\0346Istakhri\0346Istakhri.MasalikWaMamalik\0346Istakhri.MasalikWaMamalik.Shamela0011680-ara1.mARkdown"
    outfp = r"D:\London\OpenITI\visualization\Nuwayri\nuwayri_d3\data\2021.2.5_Shamela0011680_sections.csv"
    #headings, last_ms = section_headings_by_milestone(fp, outfp)
    #identify_section_endings(headings, last_ms, outfp)
    
    fp = r"C:\Users\peter\Downloads\0310Tabari.Tarikh.Shamela0009783BK1-ara1.mARkdown"
    outfp = r"D:\London\OpenITI\visualization\Nuwayri\nuwayri_d3\data\2021.2.5_Shamela0009783BK1_sections.csv"
    headings, last_ms = section_headings_by_milestone(fp, outfp)
    identify_section_endings(headings, last_ms, outfp)
    
