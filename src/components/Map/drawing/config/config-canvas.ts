import { DrawerContext } from '../drawer';
import BgPainter from '../painters/BgPainter';

export default function configCanvas(context: DrawerContext) {
    context.requirePainter('canvas', BgPainter, 5);
};

