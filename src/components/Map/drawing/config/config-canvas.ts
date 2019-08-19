import { DrawerContext } from '../Drawer1';
import BgPainter from '../painters/BgPainter';

export default function configCanvas(context: DrawerContext) {
    context.requirePainter('canvas', BgPainter, 5);
};

