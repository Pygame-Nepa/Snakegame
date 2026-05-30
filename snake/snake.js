(function() {

  var controller, display, game;

  controller = {

    down:false, left:false, right:false, up:false,

    keyUpDown:function(event) {

      var key_state = (event.type == "keydown")?true:false;

      switch(event.keyCode) {

        case 37: controller.left = key_state; break; // left key
        case 38: controller.up = key_state; break; 
        case 39: controller.right = key_state; break; 
        case 40: controller.down = key_state; break;

      }

    }

  };

  display = {

    buffer:document.createElement("canvas").getContext("2d"),
    context:document.querySelector("canvas").getContext("2d"),
    output:document.querySelector("p"),

    graphics: {

      0: {

        canvas:document.createElement("canvas"),
        draw:function() {

          var context = this.canvas.getContext("2d");
          this.canvas.height = this.canvas.width = game.world.tile_size;

          context.fillStyle = "#202830";
          context.fillRect(0, 0, this.canvas.width, this.canvas.height);
          context.fillStyle = "#303840";
          context.fillRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);

        }

      },

      1: {

        canvas:document.createElement("canvas"),
        draw:function() {

          var context = this.canvas.getContext("2d");
          this.canvas.height = this.canvas.width = game.world.tile_size;

          context.fillStyle = "#202830";
          context.fillRect(0, 0, this.canvas.width, this.canvas.height);
          context.fillStyle = "#ff9900";
          context.fillRect(1, 1, game.world.tile_size - 2, game.world.tile_size - 2);

        }

      },

      2: {

        canvas:document.createElement("canvas"),
        draw:function() {

          var context = this.canvas.getContext("2d");
          this.canvas.height = this.canvas.width = game.world.tile_size;

          context.fillStyle = "#202830";
          context.fillRect(0, 0, this.canvas.width, this.canvas.height);
          context.fillStyle = "#99ff00";
          context.fillRect(1, 1, game.world.tile_size - 2, game.world.tile_size - 2);

        }

      },

    },

    background_tile:0,
    segment:1,
    apple:2,


    render:function() {

      for (let index = 0; index < game.world.map.length; index ++) {

        let graphic = this.graphics[game.world.map[index]].canvas;

        this.buffer.drawImage(graphic, 0, 0, graphic.width, graphic.height, (index % game.world.columns) * game.world.tile_size, Math.floor(index / game.world.columns) * game.world.tile_size, game.world.tile_size, game.world.tile_size);

      }

      
      let leading_zeros = "SCORE: ";
      for (let index = 4 - game.score.toString().length; index > 0; -- index) {

        leading_zeros += "0";

      }

      this.output.innerHTML = leading_zeros + game.score;

     
      this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);

    },

    resize:function(event) {

      var client_height = document.documentElement.clientHeight;

      display.context.canvas.width = document.documentElement.clientWidth - 32;

      if (display.context.canvas.width > client_height - 64 || display.context.canvas.height > client_height - 64) {

        display.context.canvas.width = client_height - 64;

      }

      display.context.canvas.height = display.context.canvas.width;

      display.render();

      let elements = document.querySelectorAll(".hideable");

      for (let index = elements.length - 1; index > -1; -- index) {

        if (document.body.offsetHeight < document.body.scrollHeight) {

          elements[index].style.visibility = "hidden";

        } else {

          elements[index].style.visibility = "visible";

        }

      }

    }

  };

  game = {

    score:0,

    apple: {

      index:Math.floor(Math.random() * 400)

    },

    snake: {

      head_index:209,
      old_head_index:undefined,
      segment_indices:[209, 210],
      vector_x:0,
      vector_y:0

    },

    world:{

      columns:20,
      tile_size:10,
      map:new Array(400).fill(display.background_tile)

    },

    
    accumulated_time:0,
    time_step:250,
    reset:function() {

      this.score = 0;

      for (let index = this.snake.segment_indices.length - 1; index > -1; -- index) {

        this.world.map[this.snake.segment_indices[index]] = display.background_tile;

      }

      this.snake.segment_indices = [209, 210];
      this.snake.head_index = 209;
      this.snake.old_head_index = undefined;
      this.snake.vector_x = this.snake.vector_y = 0;
      this.world.map[game.apple.index] = display.apple;
      this.world.map[game.snake.segment_indices[0]] = display.segment;
      this.world.map[game.snake.segment_indices[1]] = display.segment;

      this.time_step = 250;

      this.loop();
      display.render();

    },

    loop:function(time_stamp) {

      
      if (controller.down) {

        game.snake.vector_x = 0;
        game.snake.vector_y = 1;

      } else if (controller.left) {

        game.snake.vector_x = -1;
        game.snake.vector_y = 0;

      } else if (controller.right) {

        game.snake.vector_x = 1;
        game.snake.vector_y = 0;

      } else if (controller.up) {

        game.snake.vector_x = 0;
        game.snake.vector_y = -1;

      }

      if (time_stamp >= game.accumulated_time + game.time_step) {

        game.accumulated_time = time_stamp;

        if (game.snake.vector_x != 0 || game.snake.vector_y != 0) {

          
          if (game.snake.head_index + game.snake.vector_y * game.world.columns + game.snake.vector_x == game.snake.old_head_index) {

            game.snake.vector_x = game.snake.vector_y = 0;
            window.requestAnimationFrame(game.loop);
            return;

          }

          
          let tail_index = game.snake.segment_indices.pop();
          game.world.map[tail_index] = display.background_tile;
          game.snake.old_head_index = game.snake.head_index;
          game.snake.head_index += game.snake.vector_y * game.world.columns + game.snake.vector_x;
        
          if (game.world.map[game.snake.head_index] == display.segment
            || game.snake.head_index < 0
            || game.snake.head_index > game.world.map.length - 1
            || (game.snake.vector_x == -1 && game.snake.head_index % game.world.columns == game.world.columns - 1)
            || (game.snake.vector_x == 1 && (game.snake.head_index % game.world.columns == 0))) {

            game.reset();
            return;

          }

          
          game.world.map[game.snake.head_index] = display.segment;
          
          game.snake.segment_indices.unshift(game.snake.head_index);

          
          if (game.snake.head_index == game.apple.index) {

            game.score ++;
            game.time_step = (game.time_step > 100)?game.time_step - 10:100;

            game.snake.segment_indices.push(tail_index);
            game.world.map[tail_index] = display.segment;
            game.apple.index = Math.floor(Math.random() * game.world.map.length);

            if (game.snake.segment_indices.length == game.world.map.length - 1) {

              game.reset();
              return;

            }

            while(game.world.map[game.apple.index] != display.background_tile) {

              game.apple.index ++;

              if (game.apple.index > game.world.map.length - 1) {

                game.apple.index = 0;

              }

            }

            game.world.map[game.apple.index] = display.apple;

          }

          display.render();

        }

      }

      window.requestAnimationFrame(game.loop);

    }

  };


  display.buffer.canvas.height = display.buffer.canvas.width = game.world.columns * game.world.tile_size;

  for(let object in display.graphics) {

    display.graphics[object].draw();

  };

  window.addEventListener("resize", display.resize);
  window.addEventListener("keydown", controller.keyUpDown);
  window.addEventListener("keyup", controller.keyUpDown);

  game.reset();
  display.resize();

})();