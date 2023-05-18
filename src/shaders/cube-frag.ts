export default `#version 300 es

in highp vec4 color;

out highp vec4 FragColor;

void main()
{
    // FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
    // FragColor = color;
    FragColor = color;
}`