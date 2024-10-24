/*
*
Trabalho realizado por: Diogo Rosa nº57464, Filipe Santo nº58388
*
*/

attribute vec4 vPosition;
attribute float movable;
uniform float table_width,table_height;
uniform int numElectrons;
uniform int numProtons;
const int MAX_CHARGES=50;
uniform vec2 electronPos[MAX_CHARGES];
uniform vec2 protonPos[MAX_CHARGES];
varying vec4 fColor;

const float TWOPI = 6.28318530718;
const float COLOUMB = pow(8.988,9.0);
const float CHARGE_VAL =  0.0000001;

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple

vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}

vec2 calcElecVec(vec2 val){
    float dist = distance(vec2(vPosition.x,vPosition.y),val);
    float elecField = (COLOUMB*CHARGE_VAL)/(dist*dist);
    vec2 temp = vec2((vPosition.x-val.x)/dist,(vPosition.y-val.y)/dist);

    return temp*elecField;
}

void main()
{
    vec2 result = vec2(0.0,0.0);
    if(movable  == 1.0){
        vec2 temp;
        float dist,elecField;
        for(int i = 0; i<MAX_CHARGES;i++){
            if(i<numElectrons)  result -= calcElecVec(electronPos[i]);

            if(i<numProtons)    result += calcElecVec(protonPos[i]);
        }

        if(length(result) > 0.25)   result = normalize(result)*0.25;

        fColor = colorize(result);
        
    }else{
        fColor = vec4(0.0,0.0,0.0,1.0);
    }
        gl_Position.x = (vPosition.x+result[0]) / (table_width/2.0);
        gl_Position.y = (vPosition.y+result[1]) / (table_height/2.0);
        gl_Position.z = 0.0;
        gl_Position.w = 1.0;
        gl_PointSize = 2.0;
}
