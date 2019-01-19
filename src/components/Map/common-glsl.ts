export const dimColor = `
vec4 dimColor(vec4 col, float amount){
    float lightenFactor = 1.0;// + (0.01 * amount);
    vec3 grayXfer = vec3(0.3, 0.59, 0.11) * lightenFactor;
    vec3 colStraight = col.rgb / col.w;
    vec3 gray = vec3(dot(grayXfer, colStraight));
    vec3 m = mix(colStraight, gray, amount);
    m = mix(m, vec3(0.0,0.0,0.0), amount/2.0);
    //vec3 m = mix(colStraight, gray, amount);
    // we may have rgb > 1.0, see if this needs to be fixed somewhere
    col = vec4(m * col.w, col.w / lightenFactor / lightenFactor / lightenFactor);
    //col = mix(col, vec4(0.0,0.0,0.0,col.w), amount/2.0);
    return col;
}

`; 

/*

vec4 dimColor(vec4 col, float amount){
    float scale = 1.0 - (0.04 * amount);
    vec3 grayXfer = vec3(0.3, 0.59, 0.11) * scale;
    vec3 colStraight = col.rgb / col.w;
    vec3 gray = vec3(dot(grayXfer, colStraight));
    vec3 m = mix(colStraight, gray, amount);
    // we may have rgb > 1.0, see if this needs to be fixed somewhere
    return vec4(m * col.w, col.w / scale / scale / scale);
}

vec4 dimColor(vec4 col, float desaturation){
    float lightenFactor = 1.0;// + (0.01 * desaturation);
    vec3 grayXfer = vec3(0.3, 0.59, 0.11) * lightenFactor;
    vec3 colStraight = col.rgb / col.w;
    vec3 gray = vec3(dot(grayXfer, colStraight));
    vec3 m = mix(colStraight, gray, desaturation);
    //vec3 m = mix(colStraight, gray, desaturation);
    // we may have rgb > 1.0, see if this needs to be fixed somewhere
    col = vec4(m * col.w, col.w / lightenFactor / lightenFactor / lightenFactor);
    col = mix(vec4(0.0,0.0,0.0,1.0), col, desaturation/2.0);
    return col;
}

vec4 dimColor(vec4 col, float desaturation){
    float lightenFactor = 1.0 + (0.04 * desaturation);
    vec3 grayXfer = vec3(0.3, 0.59, 0.11) * lightenFactor;
    vec3 colStraight = col.rgb / col.w;
    vec3 gray = vec3(dot(grayXfer, colStraight));
    vec3 m = mix(colStraight, gray, desaturation);
    // we may have rgb > 1.0, see if this needs to be fixed somewhere
    return vec4(m * col.w, col.w / lightenFactor / lightenFactor / lightenFactor);
}
*/