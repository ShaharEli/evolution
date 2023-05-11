import { Creature } from "classes";
import { useEffect, useRef } from "react";

interface IProps {
  creatures: Creature[];
  target: Creature;
}
const Canvas = ({ creatures, target }: IProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    target.place(ctx.canvas.width / 2, ctx.canvas.height / 2);

    for (let i = 0; i < creatures.length; i++) {
      creatures[i].see(ctx, target.getPosition(), target.size);
      creatures[i].move(ctx);
      creatures[i].calcFitness(ctx, target.getPosition(), target.size);
      creatures[i].draw(ctx);
    }

    target.draw(ctx);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    let frameCount = 0;
    let animationFrameId: number;
    creatures.forEach((c) =>
      c.place((context as CanvasRenderingContext2D).canvas.width / 2, c.size)
    );
    target.place(
      (context as CanvasRenderingContext2D).canvas.width / 2,
      (context as CanvasRenderingContext2D).canvas.height / 2
    );

    const render = () => {
      frameCount++;
      draw(context as CanvasRenderingContext2D, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [creatures]);
  return (
    <canvas
      width={300}
      height={300}
      ref={canvasRef}
      //   onClick={(e) => {
      //     const rect = canvasRef.current?.getBoundingClientRect();
      //     if (!rect) return;
      //     creatures[0].place(e.clientX - rect.left, e.clientY - rect.top);
      //   }}
      className=" border-black border-2 mx-auto"
    />
  );
};

export default Canvas;
