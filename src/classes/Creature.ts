import { Brain } from "./Brain";
import { Vision } from "./Vision";
const SIDES_OFFSET = 10;

interface INetConfig {
  biases: number[][];
  layers: number[];
  weights: number[][][];
}
export class Creature {
  x;
  y;
  size;
  color;
  speedX;
  speedY;
  acceleration;
  fitness;
  brain;
  vision;
  prevFitnessCalc;
  timesFittedTheSame;
  prevColor;
  ctx: CanvasRenderingContext2D | null;
  constructor(
    color?: string,
    size?: number,
    brain?: Brain,
    netConfig?: INetConfig
  ) {
    this.x = 0;
    this.y = 0;
    this.size = size || 5;
    this.color = color || "#000000";
    this.speedX = 0;
    this.speedY = 0;
    this.acceleration = 0.15;
    this.fitness = 0;
    this.brain =
      brain ||
      (!!netConfig
        ? new Brain(netConfig.layers, netConfig.weights, netConfig.biases)
        : new Brain([10, 6, 4]));
    this.vision = new Vision(this.x, this.y, undefined, undefined, false);
    this.prevFitnessCalc = Infinity;
    this.timesFittedTheSame = 0;
    this.prevColor = this.color;
    this.ctx = null;
  }

  toggleRaysShown() {
    this.vision.toggleRaysShown();
  }
  place(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.onChange();
  }

  moveRandomly(ctx: CanvasRenderingContext2D) {
    const r = Math.random();
    if (r <= 0.25) {
      this.speedX += this.acceleration;
    } else if (r <= 0.5) {
      this.speedX -= this.acceleration;
    } else if (r <= 0.75) {
      this.speedY += this.acceleration;
    } else {
      this.speedY -= this.acceleration;
    }

    this.x += this.speedX;
    this.y += this.speedY;
    this.reposition(ctx);
  }

  placeRandom(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    const isTop = !!(Math.random() > 0.5);
    const isLeft = !!(Math.random() > 0.5);
    const isOnXAxis = !!(Math.random() > 0.5);
    this.place(
      isOnXAxis
        ? Math.random() * ctx.canvas.width
        : isLeft
        ? 0
        : ctx.canvas.width,
      !isOnXAxis
        ? Math.random() * ctx.canvas.height
        : isTop
        ? 0
        : ctx.canvas.height
    );
    // this.speedX =
    //   Math.random() < 0.5 ? this.acceleration / 2 : -this.acceleration / 2;
    // this.speedY =
    //   Math.random() < 0.5 ? this.acceleration / 2 : -this.acceleration / 2;
    this.reposition(ctx);
    this.onChange();
  }

  onChange() {
    this.vision.updatePosition(this.getPosition());
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }
  move(ctx: CanvasRenderingContext2D) {
    const decisions = this.brain.decide([
      ...this.vision.getRays(),
      this.speedX,
      this.speedY,
    ]);
    if (decisions[0]) {
      if (!decisions[1] && this.speedY < 0) {
        // console.log("trying to slow going up");
        // this.speedY /= 2;
      }
      this.speedY += this.acceleration;
    }

    if (decisions[1]) {
      if (!decisions[0] && this.speedY > 0) {
        // this.speedY /= 2;
        // document.title = "######";
      }
      this.speedY -= this.acceleration;
    }

    if (decisions[2]) {
      if (!decisions[3] && this.speedX < 0) {
        // console.log("trying to slow going left");
      }
      this.speedX += this.acceleration;
    }

    if (decisions[3]) {
      if (!decisions[2] && this.speedX > 0) {
        // console.log("trying to slow going right");
      }
      this.speedX -= this.acceleration;
    }

    this.x += this.speedX;
    this.y += this.speedY;
    this.reposition(ctx);
  }
  setColorBack() {
    this.color = this.prevColor;
  }
  reposition(ctx: CanvasRenderingContext2D) {
    if (this.x - this.size < 0) {
      this.x = this.size;
      this.speedX = 0;
    }
    if (this.x + -this.size > ctx.canvas.width) {
      this.x = ctx.canvas.width - this.size;
      this.speedX = 0;
    }
    if (this.y - this.size < 0) {
      this.y = this.size;
      this.speedY = 0;
    }
    if (this.y + -this.size > ctx.canvas.height) {
      this.y = ctx.canvas.height - this.size;
      this.speedY = 0;
    }
  }
  setColor(color: string) {
    this.color = color;
  }
  makeChild(creature: Creature) {
    const newBrain = this.brain.combineBrains(creature.brain);
    return new Creature(this.color, undefined, newBrain);
  }

  getPosition() {
    return [this.x, this.y];
  }

  see(ctx: CanvasRenderingContext2D, pos: number[], size: number) {
    this.vision.updatePosition(this.getPosition());
    return this.vision.cast(ctx, pos, size);
  }

  calcFitness(ctx: CanvasRenderingContext2D, pos: number[], size: number) {
    const [posX, posY] = pos;

    const maxDist = Math.sqrt(ctx.canvas.width ** 2 + ctx.canvas.height ** 2);
    const distFromTarget = Math.sqrt(
      (this.x - posX) ** 2 + (this.y - posY) ** 2
    );
    const newCalc = ((maxDist - distFromTarget) * 3) / maxDist;

    if (
      !this.vision.rays.some((ray) => ray > 0) &&
      (this.x + this.size + SIDES_OFFSET >= ctx.canvas.width ||
        this.x - this.size - SIDES_OFFSET <= 0 ||
        this.y - this.size - SIDES_OFFSET <= 0 ||
        this.y + this.size + SIDES_OFFSET >= ctx.canvas.height)
    ) {
      this.fitness -= 0.25;
    } else {
      if (distFromTarget < this.size + size) {
        this.fitness += 3;
      }
      if (this.vision.rays.some((ray) => ray > 0)) {
        this.fitness +=
          this.vision.rays.reduce((acc, ray) => (ray > 0 ? acc + 1 : acc), 0) /
          2;
      }
      this.fitness += newCalc;
    }
  }
}
