import Drawer from "./Drawer";

/*
 
Drawer - can be initialized with objects to draw
Later, these object can be modified by visibility/color
Also unforms like u_matrix and dim affect what is rendered
 

We can introduce smthn like DOM.


Or we can abstract from to drawing object


NativeDrawer

Drawer


draw function collects objects to draw (to different drawers)
// each object will call callbacks when its property gets changed
// also u_matrix may also be wanted to be animated!

 */

// drawer objects waits for some external events and updatesDrawer when needed

interface Drawer1 {

}

// these objects (booths) are pinged by state change monitor for them to recalc state values
interface DrawerObject {
    // requireUpdateCallback is also called when animation frame is required
    new(drawer:Drawer, requireUpdateCallback:Function):DrawerObject;
    configure();
    // these objects call requireUpdateCallback when it feels like color/visibilty will be updated
    update();
}

// drawer objects -> u_matrix can also be set via DrawerObject!
// but special one and the first one

// ZoomDrawerObject -> takes zoom transform and
// DimObject -> sets drawers dim uniform




// minimum set of data to render fp
// 

interface DrawState {
    u_matrix: any,
    //set of booths
}

function buildFromState() {
    //effectively everi
}



