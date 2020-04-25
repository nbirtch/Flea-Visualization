# Flea Visualization v0.1-wip - Gary and Friends  
See 436v Process Log Writeup.pdf for final project writeup.

# Documentation and Rationale
All expected functionality is documented below, anything labelled WIP will describe the parts of the functionality not yet fully implemented. 

### Description:  
On the top of the page, we have various UI widgets that support interactions and filters both visualizations as described below.

Just below, we have the regional map visualization which shows the flea distribution across the world. Individual flea data points are visually encoded as small circle point marks while geographical region are encoded as area marks.

Between the map visualization and the dot visualization, we have UI widgets that support interactions and filters both visualizations as described below. 

At the bottom of the page, we have the dot visualization that allows the user to sort, filter and individually select data points by an attribute of focus. Individual flea data points are visually encoded as hollow circle point marks in the dot visualization. Dot colour encodes the attribute of focus values and the filled center encodes the selection.

Beside our visualizations, we will display relevant pictures and guides alongside any additional information and external educational links. (WIP - Not Implemented)

### Interactions:
- The default state: When no filtering has occured, all map points will be shown and all dots selected.  
- When a continent or country on the map is selected, the map will recenter and zoom on the selection area, and the map and dot visualization will reflect the region filtering. (WIP - recenter/zoom on selection area)  
- Hovering on individual data points in the dot visualization or the continents/countries/points on the map will display a related tooltip. (WIP - dot visualization tool tips)  
- When dots are selected, the related data point on the map will be shown. If deselected, the point on the map will be hidden. (WIP - Not implemented)  
- User will be able to scroll dot visualization left and right with a subset view of data points.  
- User will be able to select and change the attribute of focus via dropdown which updates the dot visualization and its index.  
- User will be able to place a start and end point for a selection range to filter. (WIP - Not implemented)
- A sort button with ascending/descending options will resort the dot visualization data points on the attribute of focus.  
- Clicking checkboxes next to index entries will allow the user to quickly filter the current selection of data points on particular values.  

### UI Widgets:
- A range slider allows users to filter the data by date.  
- Two dropdowns that recenter and zoom in the map on selected Continent or Country, filters the data. (WIP - recenter/zoom)  
- A categorization widget that allows user to change the map visualization encoding between default, colour blind friendly and host icons (ie. cat, dog, etc.). (WIP - Icon marks)  
- A reset button that returns map and dot visualization to default state.  

### Rationale:
The focus of our design choices were to allow the user to drill down on the dataset as quickly intuitively as possible while conveying useful and interesting information. Visually-oriented users will be serviced by being able to select regions and dots to highlight, focus on and discover their areas of interest while more data-oriented individuals will be able to more directly find the information they need using the dropdowns, sliders and index filters.

The data point filtering through region/dot selection, dropdown and the date range slider as well as the map zoom and subset dot view all serve to aid browsing and exploring the distribution of fleas relevant to the user.

The two visualizations in conjunction and the colour coded indexing in the dot visualization specifically allow the user to easily compare the differences and trends of various attributes between fleas.

| Data Variable    | Type         | Cardinality/Range            |
|------------------|--------------|------------------------------|
| ID               | Categorical  | 5,128                        |
| Sample #         | Categorical  | 944                          |
| Specimen #       | Categorical  | 686                          |
| Flea Species     | Categorical  | 14                           |
| Subspecies       | Categorical  | 6                            |
| Gender           | Categorical  | 3                            |
| Continent        | Categorical  | 6                            |
| Country          | Categorical  | 57                           |
| Region           | Categorical  | 218                          |
| Latitude         | Quantitative | -46.0988 , 58.3776           |
| Longitude        | Quantitative | -179.9813, 177.4356          |
| Host Species     | Categorical  | 14                           |
| Host Description | Categorical  | 40                           |
| Collection Date  | Quantitative | Jan 1st 2006, March 2nd 2017 |
| Collector Name   | Categorical  | 81                           |
| Clade            | Categorical  | 8                            |
| Cluster          | Categorical  | 4                            |
| Notes            | Categorical  | 37                           |

# Visualization Changes
Our initial proposal had serious flaws and was heavily revised to best achieve our visualization goals, so we will be focusing on the changes since our revision.  

See our revised proposal here: https://docs.google.com/document/d/1Wdk7BmC3k7OTTVL7H8RQ_43dOqs9SIZD8Vdmzn1uh2A/edit?usp=sharing  

The goal of our visualizations in both the original and revised proposal is to provide an exploratory data analysis tool that allows scientists and interested parties to visually explore a dataset of flea specimens collected globally. Our views aim to clearly show details about the fleas, their hosts and their locale, while also allowing users to explore different aspects of this data by filtering and re-ordering on different variables in order to discover and compare factors between collected specimens.

While our visualization is still WIP, the user is currently able to explore the dataset while filtering and sorting on variables of interest. The user is able to easily explore, discover and browse through the dataset and we will continue to improve and expose more information from the flea data points in meaningful encodings and interactions to support comparisons.

# Prototype Screenshots 
Map Visualization:
![Alt text](mapVisSS.PNG?raw=true "Map Visualization")

Dot Visualiation:
![Alt text](dotVisSS.PNG?raw=true "Dot Visualization")

# Data Source
Dataset: http://dx.doi.org/10.17632/2f3hchym9v.1

Attribution: Lawrence, Andrea (2019), “Global flea collection specimen details:

Supplementary Table 1”, Mendeley Data, v1.

License: https://creativecommons.org/licenses/by/4.0/

# Data Preprocessing
Originally, some fleas in our dataset did not have an ID, so in order to distinguish individual fleas we combined the "sample no#", "specimen no#" and "flea species" as a default flea ID if not provided. As well, the dataset only showed the number of female and male fleas per flea ID (e.g. flea CTENO370-18 contains 1 females and 1 males). In order to represent each individual flea, we created new fleas based on these gender counts, and we added a new property "gender" to the flea data. We set the newly created flea IDs to be a combination of orginal ID (or default flea ID), gender and an indexed count (e.g. CTENO370-18-M1 as male 1, CTENO370-18-F1 as female 1).

# Status Update:
| Project Milestone | Time Estimate (Reality) | Target Date (Reality) | Responsible | 
|-------------------|-------------------------|-----------------------|-------------|
| Design + Proposal | 12h (12h w/ Revision) | March 7th (March 7th, Revision - March 20th) | Nick, Jiawei |
| Map Vis. Levels | 12h (14h) | March 15th (March 28th) | Nick |
| Dot Vis. Sort/Selection | 16h (16h) | March 15th (March 24th) | Jiawei |
| Add UI Widgets | 8h (8h) | March 25th (March 25th) | Nick, Jiawei |
| M2 Write-up | 8h (6h) | March 25th (M2 Extended - March 28th) | Nick, Jiawei |
| --- | --- | --- | --- |
| Dot Vis. Filter | 4h (WIP - 1h) | March 15th (WIP - April 2nd) | Jiawei  |
| Link Vis. Bidirectionally | 8h (WIP - 2h) | March 22nd (WIP - April 2nd) | Nick, Jiawei |
| Map/Dot Vis. Tooltips| 4h (WIP - 1h) | March 29th (WIP - April 2nd) | Nick, Jiawei |
| Map Center/Zoom | 4h (WIP - 1h) | March 29th (WIP - April 2nd) | Nick |
| Styling Improvements | 4h | April 5th | Jiawei |
| Misc: Graphics, Info. Links, Improvements | 8h | April 5th | Nick |
| M3 Write-up/Presentation | 12h | April 10th | Nick, Jiawei |



# Contributions Breakdown:
The workload distribution was equal and agreed upon. Both of us communicated our progress and expectations throughout and delivered what was expected of eachother. Nick primarily worked on the map visualization while Jiawei worked on the dot visualization. We both worked on setting up the page layout, widget interactions, and starting on bidirectional visualization links.

# Team Process:
Team has a clear vision of the problem(s): Good - We have a clear vision and understanding of the remaining work that is expected of us in M3. Once we're further into completing the visualizations and bidirectional links, we will be able to better analyze usability and hollistic issues to refine our visualization.

Team is properly organized to complete task and cooperates well: Excellent - Continue communicating, pushing often and helping eachother out.

Team managed time wisely: Good - We had a later start due to needing to revise our project proposal, but going forward and with our current progress, we feel we will be able to manage our time better and have a better idea of time/effort estimation for the remaining tasks. For M3, we will continue with our momentum and start earlier while working through blocking factors ASAP.

Team acquired needed knowledge base: Excellent - The lecture slides, previous assignments, piazza and TA interactions were all extremely helpful in completing this portion of the project. We both felt as though we had the appropriate knowledge base and abilities to tackle the workload.

Efforts communicated well within group: Excellent - Continue communicating, pushing often and helping eachother out.

# References

Colour Palettes: https://medialab.github.io/iwanthue/

Brush Filter: https://observablehq.com/@d3/brush-filter
