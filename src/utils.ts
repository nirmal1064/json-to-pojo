import { readFileSync, writeFile } from "fs";

export const validateJson = (jsonStr: string): JSON | null => {
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    return null;
  }
};

export const capitalizeFirst = (inputString: string): string => {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
};

export const lowerCaseFirst = (inputString: string): string => {
  return inputString.charAt(0).toLowerCase() + inputString.slice(1);
};

export const getArrayDepth = (value: Array<any>): number => {
  return Array.isArray(value) ? 1 + Math.max(...value.map(getArrayDepth)) : 0;
};

export const getInnermostArray = (value: Array<any>): Array<any> => {
  let depth = getArrayDepth(value);
  let innermostArray = value;
  while (depth > 1) {
    innermostArray = innermostArray[0];
    depth--;
  }
  return innermostArray;
};

export const getArrayType = (value: Array<any>): string => {
  let innermostArray = getInnermostArray(value);
  let type = "Double";
  if (innermostArray.every((element) => element === parseInt(element))) {
    type = "Integer";
  }
  return type;
};

export const isSnakeCase = (inputString: string): boolean => {
  return inputString.indexOf("_") !== -1;
};

export const convertToCamelCase = (inputString: string): string => {
  const inputArray = inputString.split("_");
  let outputString = "";
  inputArray.forEach((element, index) => {
    if (index === 0) {
      outputString = element;
    } else {
      outputString = outputString + capitalizeFirst(element);
    }
  });
  return outputString;
};

export const getList = (depth: number, type: string): string => {
  let list = "private ";
  let closeBracket = "";
  for (let i = 0; i < depth; i++) {
    list += `List<`;
    closeBracket += `>`;
    if (i === depth - 1) {
      list += type;
    }
  }
  list += closeBracket;
  return list;
};

export const readJsonFromFile = (filePath: string): string => {
  return readFileSync(filePath, "utf8");
};

export const writeToJavaFile = (className: string, classes: string[]): void => {
  let output = "";
  classes.forEach((element) => {
    output += `${element}\n\n`;
  });
  writeFile(`${className}.java`, output, (err: any) => {
    if (err) throw err;
    console.log("Saved!");
  });
};
