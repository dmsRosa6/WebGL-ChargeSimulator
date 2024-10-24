/*
*
Trabalho realizado por: Diogo Rosa nº57464, Filipe Santo nº58388
*
*/

precision highp float;
uniform vec4 color;

void main() 
{
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    float distanceSqrd = pow(distance,30.0);

    gl_FragColor = vec4(color.x/distanceSqrd,color.y/distanceSqrd,color.z/distanceSqrd, 1.0/distanceSqrd);

    if(fragmentPosition.x >= -0.15 && fragmentPosition.x <= 0.15  && color == vec4(0.0,1.0,0.0,1.0) && fragmentPosition.y >= -0.7 && fragmentPosition.y <= 0.7){
        gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    }
    
    if(fragmentPosition.y >= -0.15 && fragmentPosition.y <= 0.15 && fragmentPosition.x >= -0.7 && fragmentPosition.x <= 0.7){  
        gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    }
}