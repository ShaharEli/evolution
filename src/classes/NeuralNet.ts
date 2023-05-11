export class NeuralNet {
  layers;
  weights;
  biases;
  weightsMutationThreshold;

  constructor(layers: number[], weights?: number[][][], biases?: number[][]) {
    this.layers = layers;
    this.weights =
      weights ||
      layers.map((layerSize, i) =>
        new Array(
          i + 1 < layers.length ? layers[i + 1] : layers[layers.length - 1]
        )
          .fill(0)
          .map((_) =>
            new Array(layerSize).fill(0).map((__) => this.mutateRate() * 500)
          )
      );
    this.biases =
      biases ||
      (this.weights as number[][][]).map((layer) =>
        new Array(layer.length).fill(0).map((__) => this.mutateRate() * 500)
      );

    this.weightsMutationThreshold = 0.95;
  }

  private relu(x: number) {
    return Math.max(0, x);
  }
  private sigmoid(x: number) {
    return Math.exp(x) / (1 + Math.exp(x));
  }

  private innerProduct(vec1: number[], vec2: number[]) {
    return vec1.reduce((prev, next, i) => prev + next * vec2[i], 0);
  }

  private matMul(firstMat: number[][], vector: number[]) {
    return firstMat.reduce(
      (acc, curr) => [...acc, this.innerProduct(curr, vector)],
      []
    );
  }

  private mutateRate() {
    return Math.random() - 0.5;
  }
  mutate() {
    this.weights = this.weights.map((wCol) =>
      wCol.map((wRow) =>
        wRow.map((w) =>
          Math.random() > this.weightsMutationThreshold
            ? w + this.mutateRate()
            : w
        )
      )
    );

    this.biases = this.biases.map((bRow) =>
      bRow.map((b) =>
        Math.random() > this.weightsMutationThreshold
          ? b + this.mutateRate()
          : b
      )
    );

    return this;
  }
  combineGenes(secNet: NeuralNet) {
    const layers = [...secNet.layers];
    const weights = this.weights.map((weightRow, i) => {
      const crossoverPoint = Math.floor(Math.random() * weightRow.length);

      return weightRow
        .slice(0, crossoverPoint)
        .concat(secNet.weights[i].slice(crossoverPoint));
    });

    const biases = this.biases.map((biasRow, i) => {
      const crossoverPoint = Math.floor(Math.random() * biasRow.length);

      return biasRow
        .slice(0, crossoverPoint)
        .concat(secNet.biases[i].slice(crossoverPoint));
    });

    return new NeuralNet(layers, weights, biases);
  }

  predict(input: number[]) {
    return this.weights.reduce(
      (acc, curr, w_idx) =>
        this.matMul(curr, acc).map((coord, i) =>
          this.sigmoid(coord + this.biases[w_idx][i])
        ),
      input
    );
  }
}
