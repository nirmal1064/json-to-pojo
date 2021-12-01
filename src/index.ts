import {
  capitalizeFirst,
  convertToCamelCase,
  getArrayDepth,
  getArrayType,
  getInnermostArray,
  getList,
  isSnakeCase,
  lowerCaseFirst,
  readJsonFromFile,
  validateJson,
  writeToJavaFile
} from "./utils";

const classes: string[] = [];

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

const generateClass = (className: string, json: any): void => {
  const javaPojo = generatePojo(json);
  const javaClass = `public class ${className} {\n\n${javaPojo}}`;
  classes.push(javaClass);
};

export const getPojoFromStr = (className: string, jsonInput: string): void => {
  let json = validateJson(jsonInput);
  if (json === null) {
    console.log("Invalid Json");
  } else {
    generateClass(className, json);
  }
  writeToJavaFile(className, classes);
};

export const getPojoFromFile = (className: string, filePath: string): void => {
  const jsonString = readJsonFromFile(filePath);
  getPojoFromStr(className, jsonString);
};
