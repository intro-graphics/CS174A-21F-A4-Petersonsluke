import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class Assignment4 extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        this.shapes = {
            box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows()
        }
        console.log(this.shapes.box_1.arrays.texture_coord)
        this.shapes.box_2.arrays.texture_coord = this.shapes.box_2.arrays.texture_coord.map(x => x.times(2));
        //times(2);
        //map(x => x.times(2));
       this.angle_1 = 0;
       this.angle_2 = 0;

        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Texture_Rotate(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png", "NEAREST")
            }),
            texture_2: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/earth.gif", "LINEAR_MIPMAP_LINEAR")
            }),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.rotating = false;
    }

//     set_rotating() {
//         this.rotating ^=1;
//     }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Start/Stop Rotating Cubes", ["c"], () => {
            this.rotating ^=1;
        });
    }


    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -8));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // You can remove the folloeing line.
        //let angle = 0;
        let first_transform = model_transform.times(Mat4.translation(-2,0,0));
        //this.shapes.axis.draw(context, program_state, model_transform, this.materials.phong.override({color: hex_color("#ffff00")}));
        if (this.rotating == true) {
            this.angle_1 = this.angle_1 + dt;
            let ang = this.angle_1;
            first_transform = first_transform.times(Mat4.rotation(2/3*Math.PI*ang,1,0,0));
            this.shapes.box_1.draw(context, program_state, first_transform, this.materials.texture);
        } else {
            let ang = this.angle_1;
            first_transform = first_transform.times(Mat4.rotation(2/3*Math.PI*ang,1,0,0));
            this.shapes.box_1.draw(context, program_state, first_transform, this.materials.texture);
        }


        let second_transform = model_transform.times(Mat4.translation(2,0,0));
        if (this.rotating == true) {
            this.angle_2 = this.angle_2 + dt;
            let ang = this.angle_2;
            second_transform = second_transform.times(Mat4.rotation(Math.PI*ang,0,1,0));
            this.shapes.box_2.draw(context, program_state, second_transform, this.materials.texture_2);
        } else {
            let ang = this.angle_2;
            second_transform = second_transform.times(Mat4.rotation(Math.PI*ang,0,1,0));
            this.shapes.box_2.draw(context, program_state, second_transform, this.materials.texture_2);
        }


    }
}


class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                
                //scroll
                vec2 scroll = vec2(mod(animation_time,4.0)*-2.0,0.0);
                vec2 new_scroll = f_tex_coord + scroll;
                vec4 tex_color = texture2D( texture, new_scroll);

                
                //EXAMPLE CODE TAKEN FROM DIS 1C WEEK 8 EXAMPLE 4
                float u = mod(f_tex_coord.x + scroll.x, 1.0);
                float v = mod(f_tex_coord.y + scroll.y, 1.0);
                  //float distance_to_center
                  if (u > 0.75 && u < 0.85)
                  {
                    if (v > 0.15 && v < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }
                  if (u > 0.15 && u < 0.25)
                  {
                    if (v > 0.15 && v < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }
                  if (v > 0.15 && v < 0.25)
                  {
                    if (u > 0.15 && u < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }
                  if (v > 0.75 && v < 0.85)
                  {
                    if (u > 0.15 && u < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }

                 
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                
        } `;
    }
}


class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
//                 vec4 tex_color = texture2D( texture, f_tex_coord );
//                 if( tex_color.w < .01 ) discard;
                
               
                //USING MATRICES AND VEC2 TO SET ROTATION
                float rot = (-3.14/2.0)*mod(animation_time,16.0);
                mat2 rot_vec = mat2(cos(rot), sin(rot), -1.*sin(rot), cos(rot));
                vec2 extended_rot_vec = rot_vec * (f_tex_coord - vec2(0.5,0.5));
                vec2 rock = extended_rot_vec + vec2(0.5,0.5);
                vec4 tex_color = texture2D( texture, rock );

                //EXAMPLE CODE TAKEN FROM DIS 1C WEEK 8 EXAMPLE 4
                float u = rock.x;
                float v = rock.y;
                  //float distance_to_center
                  if (u > 0.75 && u < 0.85)
                  {
                    if (v > 0.15 && v < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }
                  if (u > 0.15 && u < 0.25)
                  {
                    if (v > 0.15 && v < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }
                  if (v > 0.15 && v < 0.25)
                  {
                    if (u > 0.15 && u < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }
                  if (v > 0.75 && v < 0.85)
                  {
                    if (u > 0.15 && u < 0.85) {
                        tex_color = vec4(0, 0, 0, 1.0);
                    }
                  }

                   
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

