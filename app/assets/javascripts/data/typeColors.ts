export class TypeColors{

    constructor(){
        console.log("in Constructor");
        TypeColors.TYPE_COLORS[21] = "amber darken-1";
        TypeColors.TYPE_COLORS[22] = "orange";
        TypeColors.TYPE_COLORS[23] = "light-green darken-1";
        TypeColors.TYPE_COLORS[24] = "green";
        TypeColors.TYPE_COLORS[25] = "red lighten-3";
        TypeColors.TYPE_COLORS[26] = "pink";
        TypeColors.TYPE_COLORS[27] = "grey";
        TypeColors.TYPE_COLORS[28] = "grey darken-3";
        TypeColors.TYPE_COLORS[29] = "blue darken-1";
        TypeColors.TYPE_COLORS[30] = "indigo";
    }
    public static TYPE_COLORS = [
        "grey",
        "grey darken-3",
        "amber darken-1",
        "orange",
        "red lighten-3",
        "pink",
        "blue darken-1",
        "indigo"
    ]

         // this.colorArray[1] = "red lighten-3";
        // this.colorArray[2] = "pink lighten-3";
        // this.colorArray[3] = "purple lighten-3";
        // this.colorArray[4] = "purple lighten-3";
        // this.colorArray[5] = "blue lighten-3";
        // this.colorArray[6] = "teal lighten-3";
}