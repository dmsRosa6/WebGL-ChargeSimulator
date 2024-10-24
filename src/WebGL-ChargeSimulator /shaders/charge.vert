/*
*
Trabalho realizado por: Diogo Rosa nº57464, Filipe Santo nº58388
*
*/

attribute vec4 vPosition;
uniform float table_width,table_height,opacity;

void main()
{
    gl_Position.x = vPosition.x / (table_width/2.0);
    gl_Position.y = vPosition.y / (table_height/2.0);
    gl_Position.z = 0.0;
    gl_Position.w = opacity;
    gl_PointSize = 35.0;
}