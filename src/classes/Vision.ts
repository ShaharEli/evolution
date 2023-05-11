// @ts-ignore
import collide from "line-circle-collision";

export class Vision {
  raysShown;
  x;
  y;
  rays: number[];
  raysNum;
  color;
  radius;
  constructor(
    x: number,
    y: number,
    raysNum = 8,
    radius = 60,
    raysShown = true,
    color?: string
  ) {
    this.raysShown = !!raysShown;
    this.x = x;
    this.y = y;
    this.rays = new Array(raysNum).fill(0);
    this.raysNum = raysNum;
    this.color = color || "yellow";
    this.radius = radius;
  }

  updatePosition(position: number[]) {
    this.x = position[0];
    this.y = position[1];
  }

  checkCollide(x1: number, y1: number, x2: number, y2: number, size: number) {
    const dx = x1 - this.x;
    const dy = y1 - this.y;
    const distance =
      Math.abs(dy * x2 - dx * y2 + x1 * this.y - y1 * this.x) /
      Math.sqrt(dx * dx + dy * dy);

    // If the distance is less than the radius, the line intersects the circle
    if (distance <= size) {
      return true;
    } else {
      return false;
    }
  }

  checkDist(x: number, y: number) {
    return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
  }

  cast(ctx: CanvasRenderingContext2D, objPosition: number[], objSize: number) {
    const [objX, objY] = objPosition;
    this.rays = this.rays.map((_, i) => {
      ctx.beginPath();
      const angle = (i * Math.PI * 2) / this.raysNum;
      const dx = Math.cos(angle) * this.radius;
      const dy = Math.sin(angle) * this.radius;
      const collided = collide(
        [this.x + dx, this.y + dy],
        [this.x, this.y],
        [objX, objY],
        objSize
      );
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + dx, this.y + dy);
      if (this.raysShown) {
        ctx.strokeStyle = collided ? "red" : this.color;
      }

      ctx.stroke();
      if (collided) {
        return (
          1 -
          this.checkDist(objX, objY) /
            Math.sqrt(ctx.canvas.width ** 2 + ctx.canvas.height ** 2)
        );
      }

      if (this.x + dx < 0) {
        return -(this.checkDist(0, this.y) + this.radius) / this.radius;
      }

      if (this.x + dx > ctx.canvas.width) {
        return (
          -(this.checkDist(ctx.canvas.width, this.y) + this.radius) /
          this.radius
        );
      }

      if (this.y + dy < 0) {
        return -(this.checkDist(this.x, 0) + this.radius) / this.radius;
      }

      if (this.y + dy > ctx.canvas.height) {
        return (
          -(this.checkDist(this.x, ctx.canvas.height) + this.radius) /
          this.radius
        );
      }

      return 0;
    });

    return this.rays;
  }

  getRays() {
    return this.rays;
  }
}
