export default `#version 300 es

in highp vec4 color;

out highp vec4 FragColor;

uniform int selected;

void main()
{
    if (selected == 1) {
        FragColor = vec4(0.3,0.8,0.9,1.0);
    } else {
        FragColor = color;
    }
}`