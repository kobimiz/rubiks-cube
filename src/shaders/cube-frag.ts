export default `#version 300 es
out highp vec4 FragColor;

uniform highp vec4 color;

void main()
{
    // FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
    FragColor = color;
}`