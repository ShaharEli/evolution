import { Creature } from "classes";
import Canvas from "components/Canvas";
import Toolbar from "components/Toolbar";
import { useEffect, useMemo, useState } from "react";
import { getRandomColor } from "utils/color";
import { CREATURES_AMOUNT, SURVIVAL_RATE, TIME } from "utils/consts";

function App() {
  const populate = (parents: Creature[]) => {
    const totalFitness = parents.reduce((acc, s) => acc + s.fitness, 0);

    // Calculate probability of selection for each survivor
    const probabilities = parents.map((s) => s.fitness / totalFitness);

    // Select survivors randomly based on their probabilities
    const selectedSurvivors: Creature[] = [];
    for (let i = 0; i < CREATURES_AMOUNT; i++) {
      let selectedIdx1 = 0;
      let selectedIdx2 = 0;
      let randNum1 = Math.random();
      let randNum2 = Math.random();
      for (let j = 0; j < probabilities.length; j++) {
        randNum1 -= probabilities[j];
        if (randNum1 <= 0) {
          selectedIdx1 = j;
          break;
        }
      }
      for (let j = 0; j < probabilities.length; j++) {
        randNum2 -= probabilities[j];
        if (randNum2 <= 0) {
          selectedIdx2 = j;
          break;
        }
      }
      selectedSurvivors.push(
        parents[selectedIdx1].makeChild(parents[selectedIdx2])
      );
    }

    return selectedSurvivors;
    // return [
    //   parents[0].makeChild(parents[0]),
    //   parents[0].makeChild(parents[1]),
    //   ...new Array(CREATURES_AMOUNT - 2).fill(null).map(() => {
    //     const first = parents[Math.floor(Math.random() * parents.length)];
    //     const second = parents[Math.floor(Math.random() * parents.length)];
    //     return first.makeChild(second);
    //   }),
    // ];
  };
  const [creatures, setCreatures] = useState(
    localStorage.getItem("prevData")
      ? populate(
          (
            JSON.parse(localStorage.getItem("prevData") as any)
              .nextGen as Creature[]
          ).map(
            (e: any) =>
              new Creature(e.color, e.size, undefined, {
                biases: e.biases,
                weights: e.weights,
                layers: e.layers,
              })
          )
        )
      : new Array(CREATURES_AMOUNT)
          .fill(null)
          .map(() => new Creature(getRandomColor()))
  );
  const [generation, setGeneration] = useState(
    localStorage.getItem("prevData")
      ? (JSON.parse(localStorage.getItem("prevData") as any)
          .generation as number)
      : 1
  );
  const [bestScore, setBestScore] = useState(
    localStorage.getItem("prevData")
      ? (JSON.parse(localStorage.getItem("prevData") as any)
          .bestScore as number)
      : -Infinity
  );
  const [currentScore, setCurrentScore] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      // setGeneration((g) => g + 1);
      // if (generation % 4 !== 0) {
      //   creatures.forEach(
      //     (creature) => !!creature.ctx && creature.placeRandom(creature.ctx)
      //   );
      //   return;
      // }
      setCreatures((prev) => {
        const sortedCreatures = prev
          .map((c) => {
            c.setColorBack();
            return c;
          })
          .sort((a, b) => b.fitness - a.fitness);
        setCurrentScore(sortedCreatures[0].fitness);
        const survivalCount = Math.floor(CREATURES_AMOUNT * SURVIVAL_RATE);
        const parents = sortedCreatures.slice(0, survivalCount);

        localStorage.setItem(
          "best",
          JSON.stringify(sortedCreatures[0].brain.net)
        );
        const nextGen = populate(parents);
        localStorage.setItem(
          "prevData",
          JSON.stringify({
            nextGen: parents.map((c) => ({
              color: c.color,
              size: c.size,
              biases: c.brain.net.biases,
              weights: c.brain.net.weights,
              layers: c.brain.net.layers,
            })),
            generation,
            bestScore,
          })
        );
        setBestScore(Math.max(bestScore, parents[0].fitness));
        setGeneration((g) => g + 1);
        document.title = `${Math.floor(
          Math.max(bestScore, parents[0].fitness)
        )}`;
        return nextGen;
      });
    }, 1000 * TIME);
    return () => clearInterval(interval);
  }, [bestScore, generation, creatures]);

  const target = useMemo(() => new Creature("red", 20), []);

  return (
    <div className="w-full h-full">
      <Toolbar {...{ setBestScore, setGeneration, setCreatures(cs) {} }} />
      <h2 className="mx-auto my-2 text-center">Gen: {generation}</h2>
      <h2 className="mx-auto my-2 text-center">Best score: {bestScore}</h2>
      <h2 className="mx-auto my-2 text-center">
        Best gen score: {currentScore}
      </h2>
      <div className="w-full h-full mx-auto mt-20 ">
        <Canvas creatures={creatures} target={target} />
      </div>
    </div>
  );
}

export default App;
