import * as THREE from "three";

class TextureMergerRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    finalX: number;
    finalY: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.finalX = x + width;
        this.finalY = y + height;
    }

    public set(x: number, y: number, x2: number, y2: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.finalX = x2;
        this.finalY = y2;
        this.width = width;
        this.height = height;
        return this;
    }

    public fits(texture: THREE.Texture) {
        var tw = texture.image.width;
        var th = texture.image.height;
        if (tw <= this.width && th <= this.height) {
            return true;
        }
        return false;
    }

    public fitsPerfectly(texture: THREE.Texture) {
        var tw = texture.image.width;
        var th = texture.image.height;
        return tw == this.width && th == this.height;
    }

    public overlaps(rect: TextureMergerRectangle) {
        return (
            this.x < rect.x + rect.width &&
            this.x + this.width > rect.x &&
            this.y < rect.y + rect.height &&
            this.y + this.height > rect.y
        );
    }
}

class Range {
    constructor(public startU?: number, public endU?: number, public startV?: number, public endV?: number) {}
}

class Node {
    constructor(
        public children?: [Node, Node],
        public rectangle?: TextureMergerRectangle,
        public textureName?: string,
        public upperNode?: Node
    ) {}
}

type TextureObject = Map<string, THREE.Texture>;

export default class TextureMerger {
    MAX_TEXTURE_SIZE: number;
    dataURLs: Map<string, string>;
    textureCount: number;
    maxHeight: number;
    maxWidth: number;
    canvas: HTMLCanvasElement;
    textureCache: string[];
    node: Node;
    textureOffsets: Map<string, { x: number; y: number }>;
    allNodes: Node[];

    context: CanvasRenderingContext2D;

    public ranges: Map<string, Range>;
    public mergedTexture: THREE.CanvasTexture;

    constructor(texturesObj: TextureObject) {
        if (!texturesObj || !texturesObj.size) return;

        this.MAX_TEXTURE_SIZE = 4096;

        if (!texturesObj) return;

        this.dataURLs = new Map<string, string>();

        for (var textureName of texturesObj.keys()) {
            var txt = texturesObj.get(textureName);

            if (txt instanceof THREE.CompressedTexture) {
                throw new Error("CompressedTextures are not supported.");
            }

            if (typeof txt.image.toDataURL == "undefined") {
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = txt.image.naturalWidth;
                tmpCanvas.height = txt.image.naturalHeight;
                tmpCanvas.getContext("2d").drawImage(txt.image, 0, 0);
                this.dataURLs.set(textureName, tmpCanvas.toDataURL());
            } else {
                this.dataURLs.set(textureName, txt.image.toDataURL());
            }
        }
        this.canvas = document.createElement("canvas");
        this.textureCount = 0;
        this.maxWidth = 0;
        this.maxHeight = 0;
        var explanationStr = "";
        for (textureName of texturesObj.keys()) {
            this.textureCount++;
            var texture = texturesObj.get(textureName);
            texture.userData.area = texture.image.width * texture.image.height;
            if (texture.image.width > this.maxWidth) {
                this.maxWidth = texture.image.width;
            }
            if (texture.image.height > this.maxHeight) {
                this.maxHeight = texture.image.height;
            }
            explanationStr += textureName + ",";
        }
        explanationStr = explanationStr.substring(0, explanationStr.length - 1);
        this.textureCache = [];

        this.node = new Node();
        this.node.rectangle = new TextureMergerRectangle(
            0,
            0,
            this.maxWidth * this.textureCount,
            this.maxHeight * this.textureCount
        );
        this.textureOffsets = new Map<string, { x: number; y: number }>();

        this.allNodes = [];
        this.insert(this.node, this.findNextTexture(texturesObj), texturesObj);

        this.ranges = new Map<string, Range>();

        var imgSize = this.calculateImageSize(texturesObj);
        this.canvas.width = imgSize.width;
        this.canvas.height = imgSize.height;
        var context = this.canvas.getContext("2d");
        this.context = context;
        for (textureName of this.textureOffsets.keys()) {
            var texture = texturesObj.get(textureName);
            var offsetX = this.textureOffsets.get(textureName).x;
            var offsetY = this.textureOffsets.get(textureName).y;
            var imgWidth = texture.image.width;
            var imgHeight = texture.image.height;

            for (var y = offsetY; y < offsetY + imgHeight; y += imgHeight) {
                for (var x = offsetX; x < offsetX + imgWidth; x += imgWidth) {
                    context.drawImage(texture.image, x, y, imgWidth, imgHeight);
                }
            }

            var range = new Range();
            range.startU = offsetX / imgSize.width;
            range.endU = (offsetX + imgWidth) / imgSize.width;
            range.startV = 1 - offsetY / imgSize.height;
            range.endV = 1 - (offsetY + imgHeight) / imgSize.height;
            this.ranges.set(textureName, range);
        }

        this.makeCanvasPowerOfTwo();
        this.mergedTexture = new THREE.CanvasTexture(this.canvas);
        this.mergedTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.mergedTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.mergedTexture.minFilter = THREE.NearestFilter;
        this.mergedTexture.magFilter = THREE.NearestFilter;
        this.mergedTexture.needsUpdate = true;
    }

    public isTextureAlreadyInserted(textureName: string, texturesObj: TextureObject): { x: number; y: number } {
        var texture = texturesObj.get(textureName);
        var img = this.dataURLs.get(textureName);
        for (var tName of texturesObj.keys()) {
            if (tName == textureName) {
                continue;
            }
            var txt = texturesObj.get(tName);
            var tImg = this.dataURLs.get(tName);
            if (
                img == tImg &&
                txt.offset.x == texture.offset.x &&
                txt.offset.y == texture.offset.y &&
                //txt.offset.z == texture.offset.z &&
                txt.repeat.x == texture.repeat.x &&
                txt.repeat.y == texture.repeat.y &&
                //txt.flipY.flipX == texture.flipX &&
                txt.flipY == texture.flipY &&
                txt.wrapS == texture.wrapS &&
                txt.wrapT == texture.wrapT
            ) {
                if (this.textureOffsets.get(tName)) {
                    return this.textureOffsets.get(tName);
                }
            }
        }
        return null;
    }

    public insert(node: Node, textureName: string, texturesObj: TextureObject) {
        var texture = texturesObj.get(textureName);
        var res = this.isTextureAlreadyInserted(textureName, texturesObj);

        if (res) {
            this.textureOffsets.set(textureName, res);
            var newTextureName = this.findNextTexture(texturesObj);
            if (!(newTextureName == null)) {
                this.insert(node, newTextureName, texturesObj);
            }
            return;
        }

        var tw = texture.image.width;
        var th = texture.image.height;
        if (node.upperNode) {
            var minArea = this.maxWidth * this.textureCount + this.maxHeight * this.textureCount;
            var minAreaNode;
            var inserted = false;
            for (var i = 0; i < this.allNodes.length; i++) {
                var curNode = this.allNodes[i];
                if (!curNode.textureName && curNode.rectangle.fits(texture)) {
                    this.textureOffsets.set(textureName, { x: curNode.rectangle.x, y: curNode.rectangle.y });
                    var calculatedSize = this.calculateImageSize(texturesObj);
                    var calculatedArea = calculatedSize.width + calculatedSize.height;
                    if (
                        calculatedArea < minArea &&
                        calculatedSize.width <= this.MAX_TEXTURE_SIZE &&
                        calculatedSize.height <= this.MAX_TEXTURE_SIZE
                    ) {
                        var overlaps = false;
                        for (var tName of this.textureOffsets.keys()) {
                            if (tName == textureName) {
                                continue;
                            }
                            var cr = curNode.rectangle;

                            var { x: ox, y: oy } = this.textureOffsets.get(tName);

                            var oimg = texturesObj.get(tName).image;
                            var rect1 = new TextureMergerRectangle(cr.x, cr.y, tw, th);
                            var rect2 = new TextureMergerRectangle(ox, oy, oimg.width, oimg.height);
                            if (rect1.overlaps(rect2)) {
                                overlaps = true;
                            }
                        }
                        if (!overlaps) {
                            minArea = calculatedArea;
                            minAreaNode = this.allNodes[i];
                            inserted = true;
                        }
                    }
                    this.textureOffsets.delete(textureName);
                }
            }
            if (inserted) {
                this.textureOffsets.set(textureName, { x: minAreaNode.rectangle.x, y: minAreaNode.rectangle.y });
                minAreaNode.textureName = textureName;
                if (!minAreaNode.children) {
                    var childNode1 = new Node();
                    var childNode2 = new Node();
                    childNode1.upperNode = minAreaNode;
                    childNode2.upperNode = minAreaNode;
                    minAreaNode.children = [childNode1, childNode2];
                    var rx = minAreaNode.rectangle.x;
                    var ry = minAreaNode.rectangle.y;
                    var maxW = this.maxWidth * this.textureCount;
                    var maxH = this.maxHeight * this.textureCount;
                    childNode1.rectangle = new TextureMergerRectangle(rx + tw, ry, maxW - (rx + tw), maxH - ry);
                    childNode2.rectangle = new TextureMergerRectangle(rx, ry + th, maxW - rx, maxH - (ry + th));
                    this.allNodes.push(childNode1);
                    this.allNodes.push(childNode2);
                }
                var newTextureName = this.findNextTexture(texturesObj);
                if (!(newTextureName == null)) {
                    this.insert(node, newTextureName, texturesObj);
                }
            } else {
                throw new Error("Error: Try to use smaller textures.");
            }
        } else {
            // First node
            var recW = node.rectangle.width;
            var recH = node.rectangle.height;
            node.textureName = textureName;
            var childNode1 = new Node();
            var childNode2 = new Node();
            childNode1.upperNode = node;
            childNode2.upperNode = node;
            node.children = [childNode1, childNode2];
            childNode1.rectangle = new TextureMergerRectangle(tw, 0, recW - tw, th);
            childNode2.rectangle = new TextureMergerRectangle(0, th, recW, recH - th);
            this.textureOffsets.set(textureName, { x: node.rectangle.x, y: node.rectangle.y });
            var newNode = node.children[0];
            this.allNodes = [node, childNode1, childNode2];
            var newTextureName = this.findNextTexture(texturesObj);
            if (!(newTextureName == null)) {
                this.insert(newNode, newTextureName, texturesObj);
            }
        }
    }

    public makeCanvasPowerOfTwo(canvas?: HTMLCanvasElement) {
        var setCanvas = false;
        if (!canvas) {
            canvas = this.canvas;
            setCanvas = true;
        }
        var oldWidth = canvas.width;
        var oldHeight = canvas.height;
        var newWidth = Math.pow(2, Math.round(Math.log(oldWidth) / Math.log(2)));
        var newHeight = Math.pow(2, Math.round(Math.log(oldHeight) / Math.log(2)));
        var newCanvas = document.createElement("canvas");
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;
        newCanvas.getContext("2d").drawImage(canvas, 0, 0, newWidth, newHeight);
        if (setCanvas) {
            this.canvas = newCanvas;
        }
    }

    public calculateImageSize(texturesObj: TextureObject) {
        var width = 0;
        var height = 0;
        for (var textureName of this.textureOffsets.keys()) {
            var texture = texturesObj.get(textureName);
            var tw = texture.image.width;
            var th = texture.image.height;
            var { x, y } = this.textureOffsets.get(textureName);

            if (x + tw > width) {
                width = x + tw;
            }
            if (y + th > height) {
                height = y + th;
            }
        }
        return { width: width, height: height };
    }

    public findNextTexture(texturesObj: TextureObject) {
        var maxArea = -1;
        var foundTexture;
        for (var textureName of texturesObj.keys()) {
            var texture = texturesObj.get(textureName);
            if (this.textureCache.indexOf(textureName) == -1) {
                if (texture.userData.area > maxArea) {
                    maxArea = texture.userData.area;
                    foundTexture = textureName;
                }
            }
        }
        if (maxArea == -1) {
            return null;
        }
        this.textureCache.push(foundTexture);
        return foundTexture;
    }

    public rescale(canvas: HTMLCanvasElement, scale: number) {
        var resizedCanvas = document.createElement("canvas");
        resizedCanvas.width = canvas.width * scale;
        resizedCanvas.height = canvas.height * scale;
        var resizedContext = resizedCanvas.getContext("2d");
        resizedContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, resizedCanvas.width, resizedCanvas.height);
        //this.debugCanvas(resizedCanvas);
        return resizedCanvas;
    }
}

//var sphere1 = new THREE.Mesh(new THREE.SphereBufferGeometry(10), material);
//var sphere2 = new THREE.Mesh(new THREE.SphereBufferGeometry(10), material);
//modifySphereUV(sphere1, textureMerger.ranges.texture1);

//meshs[i].material.map = textureMerger.mergedTexture;
export function modifySphereUV(mesh: THREE.Mesh, range: Range) {
    var uvAttrAry = (mesh.geometry.attributes.uv as THREE.BufferAttribute).array as number[];

    for (var i = 0; i < uvAttrAry.length; i += 2) {
        uvAttrAry[i] = uvAttrAry[i] * (range.endU - range.startU) + range.startU;
        uvAttrAry[i + 1] = uvAttrAry[i + 1] * (range.startV - range.endV) + range.endV;
    }

    mesh.geometry.attributes.uv.needsUpdate = true;
}
