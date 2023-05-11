import { NeuralNet } from "./NeuralNet";

export class Brain {
  net;
  activationThreshold;
  constructor(
    layers?: number[],
    weights?: number[][][],
    biases?: number[][],
    network?: NeuralNet
  ) {
    this.net = network || new NeuralNet(layers!, weights, biases);
    this.activationThreshold = 0.95;
  }

  decide(inputs: number[]) {
    const prediction = this.net.predict(inputs);

    return prediction.map((pred) => pred > this.activationThreshold);
  }

  combineBrains(secBrain: Brain) {
    return new Brain(
      undefined,
      undefined,
      undefined,
      this.net.combineGenes(secBrain.net).mutate()
    );
  }
}
