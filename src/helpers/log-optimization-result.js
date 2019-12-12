import chalk from "chalk";

export default function (buffer, optimizedBuffer, logPrefix, outputFileName) {
  const inputSize = buffer.toString().length;
  const outputSize = optimizedBuffer.toString().length;
  const smaller = outputSize < inputSize;
  const difference = Math.round(Math.abs(((outputSize / inputSize) * 100) - 1));

  console.log(chalk.green.bold(`${logPrefix} Optimized ${outputFileName}: ${smaller ? `~${difference}% smaller 🎉` : chalk.red(`~${difference}% bigger 🤕`)}`));
}
