//import * as d31 from 'd3';
import * as d3Selection from 'd3-selection';
import * as d3Ease from 'd3-ease';
import * as d3Interpolate from 'd3-interpolate';
import * as d3Transition from 'd3-transition';
import * as d3Zoom from 'd3-zoom';

const d3Obj = {
    ...d3Selection,
    ...d3Ease,
    ...d3Interpolate,
    ...d3Zoom,
    ...d3Transition
};

//__logger.log('d3s', d3Obj.event, d3Obj);

extendGlobal({ d3: d3Obj });

declare global {
    const d3: typeof d3Obj
}