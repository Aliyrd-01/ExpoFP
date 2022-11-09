import { Map } from "mapbox-gl";
// This implements `StyleImageInterface`
// to draw a pulsing dot icon on the map.

export function pulsingDot(size: number, map: Map) {
    let scale = 1;
    let w = scale * 200;
    let h = scale * 290;
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

            let t = counter > 60 ? 0 : 0.7;
            counter++;
            if (counter > 90) counter = 0;
            let fill = `rgba(255, 255, 255, ${t})`;

            ctx.clearRect(0, 0, this.width, this.height);

            ctx.fillStyle = "#FFFFFF55";

            ctx.beginPath();

            ctx.moveTo(176.41, 285.052);
            ctx.bezierCurveTo(176.708, 275.288, 180.719, 264.084, 185.384, 251.123);
            ctx.bezierCurveTo(190.685, 236.267, 196.684, 219.455, 198.438, 200.587);
            ctx.bezierCurveTo(199.744, 186.269, 200.441, 172.858, 194.193, 165.561);
            ctx.bezierCurveTo(191.678, 162.58, 188.182, 160.876, 184.046, 160.626);
            ctx.bezierCurveTo(180.827, 160.421, 177.255, 160.992, 174.01, 163.291);
            ctx.bezierCurveTo(173.262, 160.923, 172.156, 158.689, 170.604, 156.761);
            ctx.bezierCurveTo(167.753, 153.243, 163.636, 151.23, 158.687, 150.926);
            ctx.bezierCurveTo(153.875, 150.6, 149.796, 151.48, 146.46, 153.477);
            ctx.bezierCurveTo(145.697, 151.38, 144.643, 149.399, 143.182, 147.648);
            ctx.bezierCurveTo(140.143, 144.003, 135.954, 142.001, 130.646, 141.694);
            ctx.bezierCurveTo(126.107, 141.402, 122.143, 142.418, 118.885, 144.677);
            ctx.bezierCurveTo(118.832, 128.941, 119.044, 110.089, 119.574, 102.412);
            ctx.bezierCurveTo(120.566, 88.58, 110.534, 80.412, 100.598, 79.828);
            ctx.bezierCurveTo(90.805, 79.229, 80.394, 85.746, 79.403, 99.427);
            ctx.bezierCurveTo(78.449, 112.552, 79.01, 127.804, 79.532, 142.565);
            ctx.bezierCurveTo(80.121, 159.604, 80.79, 178.449, 78.52, 188.452);
            ctx.bezierCurveTo(77.588, 185.199, 76.447, 180.173, 75.109, 172.443);
            ctx.bezierCurveTo(72.96, 159.981, 63.096, 154.173, 54.88, 155.071);
            ctx.bezierCurveTo(47.626, 155.884, 39.269, 162.24, 39.621, 177.546);
            ctx.bezierCurveTo(40.058, 196.299, 61.294, 246.8, 68.235, 256.876);
            ctx.bezierCurveTo(73.247, 264.187, 77.881, 278.114, 77.447, 284.534);
            ctx.bezierCurveTo(77.326, 285.934, 77.835, 287.338, 78.783, 288.371);
            ctx.bezierCurveTo(79.108, 288.77, 79.532, 289.066, 79.975, 289.325);
            ctx.bezierCurveTo(80.748, 289.773, 81.582, 289.99, 82.495, 289.975);
            ctx.lineTo(171.221, 290.101);
            ctx.bezierCurveTo(174.04, 290.096, 176.338, 287.833, 176.41, 285.052);
            ctx.lineTo(176.41, 285.052);
            ctx.closePath();
            ctx.moveTo(87.476, 279.691);
            ctx.bezierCurveTo(86.322, 270.274, 81.422, 257.873, 76.706, 250.949);
            ctx.bezierCurveTo(70.525, 241.994, 50.279, 193.64, 49.892, 177.199);
            ctx.bezierCurveTo(49.714, 170.292, 51.998, 165.744, 55.888, 165.314);
            ctx.bezierCurveTo(57.225, 165.177, 58.635, 165.489, 59.964, 166.267);
            ctx.bezierCurveTo(62.329, 167.628, 64.366, 170.365, 65.047, 174.29);
            ctx.bezierCurveTo(69.002, 197.194, 72.186, 202.206, 76.599, 203.479);
            ctx.bezierCurveTo(79.098, 204.163, 81.695, 203.312, 83.596, 201.203);
            ctx.bezierCurveTo(91.167, 192.733, 90.83, 173.177, 89.772, 142.038);
            ctx.bezierCurveTo(89.249, 127.534, 88.731, 112.549, 89.607, 99.992);
            ctx.bezierCurveTo(90.174, 92.22, 95.475, 89.779, 99.844, 90.057);
            ctx.bezierCurveTo(104.964, 90.378, 109.883, 94.097, 109.326, 101.748);
            ctx.bezierCurveTo(108.666, 111.184, 108.618, 134.384, 108.618, 141.248);
            ctx.bezierCurveTo(108.606, 171.546, 108.815, 171.847, 110.379, 173.547);
            ctx.bezierCurveTo(111.254, 174.593, 112.495, 175.204, 113.839, 175.304);
            ctx.bezierCurveTo(115.226, 175.361, 116.613, 174.886, 117.659, 173.941);
            ctx.bezierCurveTo(119.354, 172.393, 119.442, 170.602, 119.555, 168.506);
            ctx.bezierCurveTo(119.665, 165.367, 120.062, 157.08, 123.903, 153.589);
            ctx.bezierCurveTo(125.321, 152.28, 127.288, 151.736, 129.879, 151.858);
            ctx.bezierCurveTo(133.103, 152.07, 134.524, 153.318, 135.293, 154.246);
            ctx.bezierCurveTo(137.878, 157.33, 138.114, 163.073, 137.874, 167.848);
            ctx.bezierCurveTo(137.658, 169.382, 137.582, 170.819, 137.531, 172.125);
            ctx.bezierCurveTo(137.483, 172.541, 137.476, 172.897, 137.415, 173.251);
            ctx.bezierCurveTo(137.041, 176.753, 136.854, 178.648, 138.426, 180.565);
            ctx.bezierCurveTo(139.338, 181.609, 140.678, 182.281, 142.061, 182.394);
            ctx.bezierCurveTo(143.471, 182.478, 144.94, 181.928, 145.984, 180.93);
            ctx.bezierCurveTo(147.776, 179.196, 147.748, 177.203, 147.748, 174.918);
            ctx.bezierCurveTo(147.741, 174.283, 147.727, 173.499, 147.755, 172.64);
            ctx.bezierCurveTo(147.874, 171.494, 147.989, 170.207, 148.064, 168.825);
            ctx.bezierCurveTo(148.439, 166.594, 149.165, 164.383, 150.602, 162.982);
            ctx.bezierCurveTo(152.127, 161.557, 154.563, 160.907, 157.911, 161.13);
            ctx.bezierCurveTo(160.715, 161.309, 161.93, 162.407, 162.632, 163.254);
            ctx.bezierCurveTo(166.491, 167.987, 164.904, 179.564, 164.295, 183.915);
            ctx.bezierCurveTo(163.868, 186.952, 163.618, 188.781, 165.162, 190.691);
            ctx.bezierCurveTo(166.02, 191.788, 167.384, 192.471, 168.799, 192.56);
            ctx.bezierCurveTo(171.067, 192.681, 173.932, 191.727, 174.522, 186.326);
            ctx.bezierCurveTo(176.023, 172.052, 180.258, 170.686, 183.289, 170.852);
            ctx.bezierCurveTo(185.041, 170.96, 185.81, 171.605, 186.343, 172.254);
            ctx.bezierCurveTo(190.287, 176.87, 188.938, 191.715, 188.191, 199.68);
            ctx.bezierCurveTo(186.56, 217.25, 180.783, 233.4, 175.674, 247.657);
            ctx.bezierCurveTo(171.638, 258.973, 167.773, 269.717, 166.55, 279.732);
            ctx.lineTo(87.476, 279.691);
            ctx.closePath();
            ctx.fill();

            // #line-7
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.moveTo(138.555, 119.274);
            ctx.bezierCurveTo(140.212, 116.526, 143.777, 115.631, 146.537, 117.295);
            ctx.lineTo(182.179, 138.717);
            ctx.bezierCurveTo(184.923, 140.386, 185.811, 143.942, 184.165, 146.708);
            ctx.lineTo(184.165, 146.708);
            ctx.bezierCurveTo(182.496, 149.475, 178.907, 150.347, 176.171, 148.706);
            ctx.lineTo(140.544, 127.256);
            ctx.bezierCurveTo(137.783, 125.608, 136.896, 122.034, 138.555, 119.274);
            ctx.lineTo(138.555, 119.274);
            ctx.closePath();
            ctx.fill();

            // #line-6
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.moveTo(146.132, 90.192);
            ctx.bezierCurveTo(145.555, 87.022, 147.649, 84.016, 150.818, 83.406);
            ctx.lineTo(191.717, 75.911);
            ctx.bezierCurveTo(194.866, 75.338, 197.907, 77.437, 198.483, 80.589);
            ctx.lineTo(198.483, 80.589);
            ctx.bezierCurveTo(199.073, 83.758, 196.957, 86.799, 193.824, 87.368);
            ctx.lineTo(152.908, 94.856);
            ctx.bezierCurveTo(149.747, 95.447, 146.725, 93.344, 146.132, 90.192);
            ctx.lineTo(146.132, 90.192);
            ctx.closePath();
            ctx.fill();

            // #line-5
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.moveTo(127.251, 64.756);
            ctx.bezierCurveTo(124.775, 62.733, 124.38, 59.068, 126.416, 56.546);
            ctx.lineTo(152.558, 24.232);
            ctx.bezierCurveTo(154.577, 21.725, 158.254, 21.34, 160.733, 23.355);
            ctx.lineTo(160.733, 23.355);
            ctx.bezierCurveTo(163.252, 25.378, 163.622, 29.054, 161.61, 31.562);
            ctx.lineTo(135.456, 63.867);
            ctx.bezierCurveTo(133.43, 66.386, 129.769, 66.75, 127.251, 64.756);
            ctx.lineTo(127.251, 64.756);
            ctx.closePath();
            ctx.fill();

            // #line-4
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.moveTo(99.838, 53.288);
            ctx.bezierCurveTo(96.627, 53.202, 94.078, 50.534, 94.166, 47.337);
            ctx.lineTo(95.172, 5.75);
            ctx.bezierCurveTo(95.267, 2.544, 97.905, 0.0, 101.126, 0.08);
            ctx.lineTo(101.126, 0.08);
            ctx.bezierCurveTo(104.351, 0.165, 106.895, 2.814, 106.819, 6.057);
            ctx.lineTo(105.807, 47.616);
            ctx.bezierCurveTo(105.721, 50.833, 103.057, 53.388, 99.838, 53.288);
            ctx.lineTo(99.838, 53.288);
            ctx.closePath();
            ctx.fill();

            // #line-3
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.moveTo(69.061, 64.024);
            ctx.bezierCurveTo(66.594, 66.087, 62.923, 65.735, 60.843, 63.28);
            ctx.lineTo(34.188, 31.382);
            ctx.bezierCurveTo(32.12, 28.915, 32.446, 25.255, 34.921, 23.202);
            ctx.lineTo(34.921, 23.202);
            ctx.bezierCurveTo(37.398, 21.128, 41.049, 21.457, 43.11, 23.925);
            ctx.lineTo(69.786, 55.817);
            ctx.bezierCurveTo(71.855, 58.292, 71.522, 61.966, 69.061, 64.024);
            ctx.lineTo(69.061, 64.024);
            ctx.closePath();
            ctx.fill();

            // #line-2
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.moveTo(52.979, 91.866);
            ctx.bezierCurveTo(52.434, 95.023, 49.404, 97.142, 46.259, 96.584);
            ctx.lineTo(5.289, 89.461);
            ctx.bezierCurveTo(2.116, 88.901, 0.0, 85.89, 0.541, 82.715);
            ctx.lineTo(0.541, 82.715);
            ctx.bezierCurveTo(1.091, 79.553, 4.104, 77.437, 7.287, 77.98);
            ctx.lineTo(48.249, 85.135);
            ctx.bezierCurveTo(51.417, 85.691, 53.532, 88.693, 52.979, 91.866);
            ctx.lineTo(52.979, 91.866);
            ctx.closePath();
            ctx.fill();

            // #line-1
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.moveTo(58.77, 123.962);
            ctx.bezierCurveTo(60.207, 126.846, 59.017, 130.327, 56.158, 131.766);
            ctx.lineTo(18.932, 150.314);
            ctx.bezierCurveTo(16.057, 151.759, 12.561, 150.584, 11.138, 147.715);
            ctx.lineTo(11.138, 147.715);
            ctx.bezierCurveTo(9.694, 144.83, 10.873, 141.338, 13.736, 139.9);
            ctx.lineTo(50.952, 121.351);
            ctx.bezierCurveTo(53.829, 119.911, 57.334, 121.1, 58.77, 123.962);
            ctx.lineTo(58.77, 123.962);
            ctx.closePath();
            ctx.fill();

            this.data = ctx.getImageData(0, 0, this.width, this.height).data as any;

            map.triggerRepaint();
            return true;
        },
    };

    return dot;
}
