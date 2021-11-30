import input from "./test.json";
import fs from "fs";

const classes: string[] = [];

const validateJson = (jsonStr: string): JSON | null => {
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    return null;
  }
};

const capitalizeFirst = (inputString: string): string => {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
};

const lowerCaseFirst = (inputString: string): string => {
  return inputString.charAt(0).toLowerCase() + inputString.slice(1);
};

const getArrayDepth = (value: Array<any>): number => {
  return Array.isArray(value) ? 1 + Math.max(...value.map(getArrayDepth)) : 0;
};

const getInnermostArray = (value: Array<any>): Array<any> => {
  let depth = getArrayDepth(value);
  let innermostArray = value;
  while (depth > 1) {
    innermostArray = innermostArray[0];
    depth--;
  }
  return innermostArray;
};

const getArrayType = (value: Array<any>): string => {
  let innermostArray = getInnermostArray(value);
  let type = "Double";
  if (innermostArray.every((element) => element === parseInt(element))) {
    type = "Integer";
  }
  return type;
};

const isSnakeCase = (inputString: string): boolean => {
  return inputString.indexOf("_") !== -1;
};

const convertToCamelCase = (inputString: string): string => {
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

const getList = (depth: number, type: string): string => {
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

const handleObject = (key: string, value: any, javaPojo: string): string => {
  key = capitalizeFirst(key);
  if (Array.isArray(value)) {
    const depth = getArrayDepth(value);
    value = getInnermostArray(value);
    if (value[0] !== null && typeof value[0] === "string") {
      javaPojo += `${getList(depth, "String")} ${lowerCaseFirst(key)};\n\n`;
    } else if (value[0] !== null && typeof value[0] === "number") {
      javaPojo += `${getList(depth, getArrayType(value))} ${lowerCaseFirst(
        key
      )};\n\n`;
    } else if (value[0] !== null && typeof value[0] === "boolean") {
      javaPojo += `${getList(depth, "Boolean")} ${lowerCaseFirst(key)};\n\n`;
    } else if (value[0] !== null && typeof value[0] === "object") {
      javaPojo += `${getList(depth, key)} ${lowerCaseFirst(key)};\n\n`;
      generateClass(key, value[0]);
    } else {
      javaPojo += `private List<Object> ${lowerCaseFirst(key)};\n\n`;
    }
  } else {
    javaPojo += `private ${key} ${lowerCaseFirst(key)};\n\n`;
    generateClass(key, value);
  }
  return javaPojo;
};

const generatePojo = (json: any) => {
  let javaPojo = "";
  const jsonKeys = Object.keys(json);
  for (let k of jsonKeys) {
    let key = k;
    let value = json[key];
    if (isSnakeCase(key)) {
      javaPojo += `@SerializedName("${key}")\n`;
      key = convertToCamelCase(key);
    }
    if (value !== null && typeof value === "object") {
      javaPojo = handleObject(key, value, javaPojo);
    } else if (typeof value === "string") {
      javaPojo += `private String ${key};\n\n`;
    } else if (typeof value === "boolean") {
      javaPojo += `private boolean ${key};\n\n`;
    } else if (typeof value === "number") {
      if (Number.isInteger(value)) {
        javaPojo += `private int ${key};\n\n`;
      } else {
        javaPojo += `private double ${key};\n\n`;
      }
    } else {
      javaPojo += `private Object ${key};\n\n`;
    }
  }
  return javaPojo;
};

// generate java class from input json
const generateClass = (className: string, json: any): void => {
  const javaPojo = generatePojo(json);
  const javaClass = `public class ${className} {\n\n${javaPojo}}`;
  classes.push(javaClass);
};

const generateJavaPojo = (className: string, jsonInput: string): void => {
  let json = validateJson(jsonInput);
  if (json === null) {
    console.log("Invalid Json");
  } else {
    generateClass(className, json);
  }
};

const jsonString = JSON.stringify(input);
generateJavaPojo("MatchJson", jsonString);
generateClass("MatchJson", input);

let output = "";
classes.forEach((element) => {
  output += `${element}\n\n`;
});

fs.writeFile(`MatchJson.java`, output, (err) => {
  if (err) throw err;
  console.log("Saved!");
});
