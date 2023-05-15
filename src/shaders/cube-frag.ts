export default `#version 300 es
out highp vec4 FragColor;

// in highp vec2 TexCoord;

// uniform sampler2D texture1;
// uniform sampler2D texture2;

void main()
{
    // FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
    FragColor = vec4(0.7, 0.7, 0.7, 1.0);
}`