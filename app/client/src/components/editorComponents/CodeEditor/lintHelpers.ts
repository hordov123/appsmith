import _ from "lodash";
import { Annotation, Position } from "codemirror";
import {
  EvaluationError,
  PropertyEvaluationErrorType,
} from "utils/DynamicBindingUtils";

export const getIndexOfRegex = (
  str: string,
  regex: RegExp,
  start = 0,
): number => {
  const pos = str.substr(start).search(regex);
  return pos > -1 ? pos + start : pos;
};

const buildBoundaryRegex = (key: string) => {
  return key
    .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    .replace(/\w+/g, "\\b$&\\b");
};

export const getAllWordOccurences = (str: string, key: string) => {
  const indicies = [];
  const keylen = key.length;
  let index, startIndex;
  const regex = new RegExp(buildBoundaryRegex(key));
  index = getIndexOfRegex(str, regex, startIndex);
  while (index > -1) {
    indicies.push(index);
    startIndex = index + keylen;
    index = getIndexOfRegex(str, regex, startIndex);
  }

  return indicies;
};

export const getKeyPositionInString = (
  str: string,
  key: string,
): Position[] => {
  const indicies = getAllWordOccurences(str, key);
  let positions: Position[] = [];
  if (str.includes("\n")) {
    for (const index of indicies) {
      const substr = str.substr(0, index);
      const substrLines = substr.split("\n");
      const ch = _.last(substrLines)?.length || 0;
      const line = substrLines.length - 1;

      positions.push({ line, ch });
    }
  } else {
    positions = indicies.map((index) => ({ line: 0, ch: index }));
  }
  return positions;
};

export const getLintAnnotations = (
  value: string,
  errors: EvaluationError[],
): Annotation[] => {
  const annotations: Annotation[] = [];
  const lintErrors = errors.filter(
    (error) => error.errorType === PropertyEvaluationErrorType.LINT,
  );
  const lines = value.split("\n");
  lintErrors.forEach((error) => {
    const {
      ch = 0,
      errorMessage,
      line = 0,
      originalBinding,
      severity,
      variables,
    } = error;

    if (!originalBinding) {
      return annotations;
    }

    let variableLength = 1;
    // Find the variable with minimal length
    if (variables) {
      for (const variable of variables) {
        if (variable) {
          variableLength =
            variableLength === 1
              ? variable.length
              : Math.min(variable.length, variableLength);
        }
      }
    }

    const bindingPositions = getKeyPositionInString(value, originalBinding);

    for (const bindingLocation of bindingPositions) {
      const currentLine = bindingLocation.line + line;
      const lineContent = lines[currentLine];
      const currentCh = originalBinding.includes("\n")
        ? ch
        : bindingLocation.ch + ch;
      // Jshint counts \t as two characters and codemirror counts it as 1.
      // So we need to subtract number of tabs to get accurate position
      const tabs = lineContent.substr(0, currentCh).match(/\t/g)?.length || 0;

      const from = {
        line: currentLine,
        ch: currentCh - tabs - 1,
      };
      const to = {
        line: from.line,
        ch: from.ch + variableLength,
      };
      annotations.push({
        from,
        to,
        message: errorMessage,
        severity,
      });
    }
  });
  return annotations;
};