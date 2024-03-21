import { Data } from "../data/Data";

export default function mergeExhibitors(arg0: Data, arg1: Data): any {
    arg1.exhibitors.forEach((exhibitor1) => {
        const exhibitor0 = arg0.exhibitors.find((x) => x.id === exhibitor1.id);
        if (exhibitor0) {
            exhibitor0.rebookingState = exhibitor1.rebookingState;
            exhibitor0.rebookingNote = exhibitor1.rebookingNote;
        }
    });
}
