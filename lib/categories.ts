export interface CategoryGroup {
    title: string;
    subheadings: string[];
  }
  
  export const CATEGORIES_DATA: CategoryGroup[] = [
    {
      title: "Geology",
      subheadings: [
        "Igneous Petrology",
        "Sedimentary",
        "Metamorphic",
        "Physical Geology",
        "Structural",
        "Mineralogy",
        "Stratigraphy",
        "Paleontology",
        "Remote Sensing",
        "Ore Geology",
        "Hydrology",
        "Geochemistry",
      ],
    },
    {
      title: "UPSC | OPSC",
      subheadings: [
        "Polity",
        "History",
        "Economics",
        "Geography",
        "Environment",
        "Current Affairs",
        "Miscellaneous",
      ],
    },
    {
      title: "Geophysics",
      subheadings: [
        "Seismic methods",
        "Electrical methods",
        "Magnetic",
        "Electromagnetic",
        "Gravity methods",
      ],
    },
    {
      title: "NEET | JEE",
      subheadings: ["Physics", "Chemistry", "Mathematics", "Biology"],
    },
    {
      title: "Miscellaneous",
      subheadings: [
        "General Geology Updates",
        "Previous Year Questions",
        "Model Test Series",
        "Important Notifications",
      ],
    },
  ];