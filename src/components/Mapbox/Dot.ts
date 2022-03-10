import { Map } from "mapbox-gl";
// This implements `StyleImageInterface`
// to draw a pulsing dot icon on the map.

export function pulsingDot(size: number, map: Map) {
    let scale = 1;
    let w = scale * 200;
    let h = scale * 212;
    let counter = 0;

    var dot = {
        context: null,
        width: w,
        height: h,

        data: new Uint8Array(w * h * 4),

        // When the layer is added to the map,
        // get the rendering context for the map canvas.
        onAdd: function () {
            const canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext("2d");
        },

        // Call once before every frame where the icon will be used.
        render: function () {
            const ctx: CanvasRenderingContext2D = this.context;

            let t = counter > 60 ? 0 : 1;
            counter++;
            if (counter > 90) counter = 0;
            let fill = `rgba(255, 255, 255, ${t})`;

            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = fill;

            ctx.beginPath();
            ctx.moveTo(199.216, 171.586);
            ctx.bezierCurveTo(195.587, 164.865, 193.928, 155.701, 191.993, 145.092);
            ctx.bezierCurveTo(189.795, 132.966, 187.269, 119.206, 181.078, 105.738);
            ctx.bezierCurveTo(176.384, 95.532, 171.586, 86.164, 164.506, 83.653);
            ctx.bezierCurveTo(161.637, 82.638, 158.593, 82.853, 155.694, 84.301);
            ctx.bezierCurveTo(153.437, 85.412, 151.233, 87.2, 149.928, 90.02);
            ctx.bezierCurveTo(148.5, 88.706, 146.893, 87.631, 145.078, 86.919);
            ctx.bezierCurveTo(141.757, 85.651, 138.174, 85.905, 134.709, 87.631);
            ctx.bezierCurveTo(131.336, 89.297, 128.905, 91.492, 127.445, 94.152);
            ctx.bezierCurveTo(126.094, 93.02, 124.602, 92.09, 122.926, 91.459);
            ctx.bezierCurveTo(119.442, 90.191, 115.811, 90.485, 112.093, 92.34);
            ctx.bezierCurveTo(108.904, 93.932, 106.618, 96.168, 105.29, 98.971);
            ctx.bezierCurveTo(99.105, 88.329, 91.869, 75.489, 89.207, 70.074);
            ctx.bezierCurveTo(84.486, 60.294, 74.5, 58.698, 67.534, 62.189);
            ctx.bezierCurveTo(60.674, 65.6, 56.154, 74.1, 60.846, 83.759);
            ctx.bezierCurveTo(65.344, 93.02, 71.671, 103.139, 77.796, 112.932);
            ctx.bezierCurveTo(84.86, 124.255, 92.691, 136.774, 95.069, 144.431);
            ctx.bezierCurveTo(93.168, 142.584, 90.425, 139.636, 86.51, 134.918);
            ctx.bezierCurveTo(80.171, 127.308, 71.208, 127.247, 65.978, 131.076);
            ctx.bezierCurveTo(61.39, 134.471, 58.226, 142.012, 64.451, 152.264);
            ctx.bezierCurveTo(72.088, 164.822, 106.225, 190.701, 114.876, 194.834);
            ctx.bezierCurveTo(121.119, 197.814, 129.711, 205.45, 131.92, 209.972);
            ctx.bezierCurveTo(132.406, 210.964, 133.284, 211.712, 134.342, 212.046);
            ctx.bezierCurveTo(134.709, 212.18, 135.117, 212.206, 135.509, 212.206);
            ctx.bezierCurveTo(136.208, 212.206, 136.882, 212.046, 137.498, 211.686);
            ctx.lineTo(197.657, 177.044);
            ctx.bezierCurveTo(199.571, 175.933, 200.235, 173.511, 199.216, 171.586);
            ctx.lineTo(199.216, 171.586);
            ctx.closePath();
            ctx.moveTo(136.837, 202.738);
            ctx.bezierCurveTo(132.371, 196.83, 124.212, 190.33, 118.289, 187.49);
            ctx.bezierCurveTo(110.618, 183.836, 77.957, 158.989, 71.268, 148.001);
            ctx.bezierCurveTo(68.463, 143.404, 68.233, 139.433, 70.682, 137.622);
            ctx.bezierCurveTo(71.507, 137.001, 72.607, 136.667, 73.807, 136.667);
            ctx.bezierCurveTo(75.946, 136.667, 78.403, 137.726, 80.403, 140.104);
            ctx.bezierCurveTo(92.043, 154.091, 96.154, 156.23, 99.655, 155.363);
            ctx.bezierCurveTo(101.613, 154.848, 103.03, 153.262, 103.497, 151.089);
            ctx.bezierCurveTo(105.297, 142.379, 97.457, 129.263, 84.533, 108.585);
            ctx.bezierCurveTo(78.513, 98.952, 72.299, 89.004, 67.981, 80.151);
            ctx.bezierCurveTo(65.313, 74.661, 67.96, 70.963, 71.027, 69.419);
            ctx.bezierCurveTo(74.626, 67.631, 79.423, 68.228, 82.036, 73.621);
            ctx.bezierCurveTo(85.262, 80.267, 94.31, 96.021, 96.998, 100.681);
            ctx.bezierCurveTo(108.852, 121.203, 109.126, 121.309, 110.824, 121.885);
            ctx.bezierCurveTo(111.833, 122.224, 112.926, 122.161, 113.859, 121.688);
            ctx.bezierCurveTo(114.824, 121.203, 115.594, 120.332, 115.924, 119.279);
            ctx.bezierCurveTo(116.457, 117.565, 115.812, 116.321, 115.055, 114.857);
            ctx.bezierCurveTo(113.927, 112.687, 110.946, 106.935, 112.193, 103.058);
            ctx.bezierCurveTo(112.651, 101.613, 113.753, 100.469, 115.565, 99.547);
            ctx.bezierCurveTo(117.825, 98.428, 119.278, 98.724, 120.158, 99.034);
            ctx.bezierCurveTo(123.118, 100.126, 125.534, 103.901, 127.23, 107.243);
            ctx.bezierCurveTo(127.691, 108.376, 128.196, 109.388, 128.682, 110.281);
            ctx.bezierCurveTo(128.807, 110.585, 128.93, 110.836, 129.037, 111.092);
            ctx.bezierCurveTo(130.148, 113.599, 130.747, 114.962, 132.573, 115.643);
            ctx.bezierCurveTo(133.608, 115.998, 134.774, 115.935, 135.756, 115.472);
            ctx.bezierCurveTo(136.76, 114.983, 137.523, 114.023, 137.845, 112.932);
            ctx.bezierCurveTo(138.406, 111.068, 137.592, 109.746, 136.685, 108.186);
            ctx.bezierCurveTo(136.441, 107.752, 136.127, 107.22, 135.813, 106.621);
            ctx.bezierCurveTo(135.435, 105.808, 135.033, 104.885, 134.536, 103.921);
            ctx.bezierCurveTo(133.887, 102.258, 133.525, 100.485, 133.951, 98.971);
            ctx.bezierCurveTo(134.429, 97.408, 135.837, 96.021, 138.177, 94.852);
            ctx.bezierCurveTo(140.15, 93.87, 141.408, 94.152, 142.212, 94.458);
            ctx.bezierCurveTo(146.68, 96.151, 150.13, 104.605, 151.425, 107.783);
            ctx.bezierCurveTo(152.336, 110.04, 152.872, 111.367, 154.652, 112.048);
            ctx.bezierCurveTo(155.676, 112.455, 156.854, 112.387, 157.868, 111.904);
            ctx.bezierCurveTo(159.452, 111.092, 161.005, 109.336, 159.284, 105.435);
            ctx.bezierCurveTo(154.73, 95.171, 157.063, 92.574, 159.198, 91.508);
            ctx.bezierCurveTo(160.414, 90.914, 161.198, 91.042, 161.814, 91.26);
            ctx.bezierCurveTo(166.268, 92.851, 171.165, 103.441, 173.788, 109.142);
            ctx.bezierCurveTo(179.55, 121.672, 181.965, 134.864, 184.097, 146.556);
            ctx.bezierCurveTo(185.77, 155.792, 187.358, 164.581, 190.453, 171.861);
            ctx.lineTo(136.837, 202.738);
            ctx.closePath();
            ctx.fill();

            // #line-7
            ctx.beginPath();
            ctx.moveTo(108.689, 74.07);
            ctx.bezierCurveTo(108.731, 71.556, 110.814, 69.541, 113.321, 69.585);
            ctx.lineTo(145.854, 70.183);
            ctx.bezierCurveTo(148.374, 70.218, 150.372, 72.298, 150.325, 74.818);
            ctx.lineTo(150.325, 74.818);
            ctx.bezierCurveTo(150.278, 77.329, 148.206, 79.33, 145.685, 79.295);
            ctx.lineTo(113.152, 78.701);
            ctx.bezierCurveTo(110.643, 78.655, 108.637, 76.566, 108.689, 74.07);
            ctx.lineTo(108.689, 74.07);
            ctx.closePath();
            ctx.fill();

            // #line-6
            ctx.beginPath();
            ctx.moveTo(102.447, 51.375);
            ctx.bezierCurveTo(100.818, 49.475, 101.045, 46.599, 102.965, 44.964);
            ctx.lineTo(127.742, 23.884);
            ctx.bezierCurveTo(129.662, 22.258, 132.542, 22.487, 134.165, 24.397);
            ctx.lineTo(134.165, 24.397);
            ctx.bezierCurveTo(135.788, 26.315, 135.572, 29.197, 133.655, 30.819);
            ctx.lineTo(108.861, 51.905);
            ctx.bezierCurveTo(106.957, 53.543, 104.083, 53.304, 102.447, 51.375);
            ctx.lineTo(102.447, 51.375);
            ctx.closePath();
            ctx.fill();

            // #line-5
            ctx.beginPath();
            ctx.moveTo(79.704, 41.531);
            ctx.bezierCurveTo(77.214, 41.135, 75.526, 38.8, 75.922, 36.32);
            ctx.lineTo(80.984, 4.182);
            ctx.bezierCurveTo(81.384, 1.701, 83.725, 0.0, 86.201, 0.393);
            ctx.lineTo(86.201, 0.393);
            ctx.bezierCurveTo(88.683, 0.787, 90.378, 3.121, 89.995, 5.598);
            ctx.lineTo(84.921, 37.736);
            ctx.bezierCurveTo(84.521, 40.217, 82.204, 41.919, 79.704, 41.531);
            ctx.lineTo(79.704, 41.531);
            ctx.closePath();
            ctx.fill();

            // #line-4
            ctx.beginPath();
            ctx.moveTo(56.647, 44.503);
            ctx.bezierCurveTo(54.43, 45.703, 51.669, 44.891, 50.467, 42.677);
            ctx.lineTo(34.878, 14.114);
            ctx.bezierCurveTo(33.674, 11.906, 34.481, 9.152, 36.699, 7.938);
            ctx.lineTo(36.699, 7.938);
            ctx.bezierCurveTo(38.907, 6.724, 41.664, 7.537, 42.868, 9.756);
            ctx.lineTo(58.449, 38.313);
            ctx.bezierCurveTo(59.66, 40.532, 58.844, 43.289, 56.647, 44.503);
            ctx.lineTo(56.647, 44.503);
            ctx.closePath();
            ctx.fill();

            // #line-3
            ctx.beginPath();
            ctx.moveTo(39.98, 63.812);
            ctx.bezierCurveTo(39.109, 66.186, 36.488, 67.384, 34.124, 66.527);
            ctx.lineTo(3.567, 55.344);
            ctx.bezierCurveTo(1.22, 54.475, 0.0, 51.872, 0.872, 49.497);
            ctx.lineTo(0.872, 49.497);
            ctx.bezierCurveTo(1.722, 47.134, 4.344, 45.922, 6.702, 46.779);
            ctx.lineTo(37.263, 57.977);
            ctx.bezierCurveTo(39.634, 58.828, 40.844, 61.454, 39.98, 63.812);
            ctx.lineTo(39.98, 63.812);
            ctx.closePath();
            ctx.fill();

            // #line-2
            ctx.beginPath();
            ctx.moveTo(39.98, 88.974);
            ctx.bezierCurveTo(40.844, 91.335, 39.634, 93.951, 37.263, 94.814);
            ctx.lineTo(6.702, 106.0);
            ctx.bezierCurveTo(4.344, 106.864, 1.722, 105.65, 0.872, 103.283);
            ctx.lineTo(0.872, 103.283);
            ctx.bezierCurveTo(0.0, 100.928, 1.22, 98.315, 3.567, 97.451);
            ctx.lineTo(34.124, 86.262);
            ctx.bezierCurveTo(36.488, 85.396, 39.109, 86.603, 39.98, 88.974);
            ctx.lineTo(39.98, 88.974);
            ctx.closePath();
            ctx.fill();

            // #line-1
            ctx.beginPath();
            ctx.moveTo(56.445, 108.466);
            ctx.bezierCurveTo(58.544, 109.844, 59.119, 112.677, 57.729, 114.774);
            ctx.lineTo(39.772, 141.915);
            ctx.bezierCurveTo(38.371, 144.0, 35.557, 144.591, 33.462, 143.187);
            ctx.lineTo(33.462, 143.187);
            ctx.bezierCurveTo(31.354, 141.803, 30.794, 138.983, 32.186, 136.881);
            ctx.lineTo(50.134, 109.751);
            ctx.bezierCurveTo(51.53, 107.665, 54.355, 107.066, 56.445, 108.466);
            ctx.lineTo(56.445, 108.466);
            ctx.closePath();
            ctx.fill();

            this.data = ctx.getImageData(0, 0, this.width, this.height).data as any;

            map.triggerRepaint();
            return true;
        },
    };

    return dot;
}
