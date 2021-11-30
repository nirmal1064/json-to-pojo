const input = require("./input.json");
const fs = require("fs");

const classes = [];

const validateJson = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
};

const capitalizeFirst = (inputString) => {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
};

const lowerCaseFirst = (inputString) => {
  return inputString.charAt(0).toLowerCase() + inputString.slice(1);
};

const getArrayDepth = (value) => {
  return Array.isArray(value) ? 1 + Math.max(...value.map(getArrayDepth)) : 0;
};

const getInnermostArray = (value) => {
  let depth = getArrayDepth(value);
  let innermostArray = value;
  while (depth > 1) {
    innermostArray = innermostArray[0];
    depth--;
  }
  return innermostArray;
};

const getArrayType = (value) => {
  let innermostArray = getInnermostArray(value);
  let type = "Double";
  if (innermostArray.every((element) => element === parseInt(element))) {
    type = "Integer";
  }
  return type;
};

const isSnakeCase = (inputString) => {
  return inputString.indexOf("_") !== -1;
};

const convertToCamelCase = (inputString) => {
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

const getList = (depth, type) => {
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

const generatePojo = (json) => {
  let javaPojo = "";
  const jsonKeys = Object.keys(json);
  for (let i = 0; i < jsonKeys.length; i++) {
    let key = jsonKeys[i];
    let value = json[key];
    if (isSnakeCase(key)) {
      javaPojo += `@SerializedName("${key}")\n`;
      key = convertToCamelCase(key);
    }
    if (value !== null && typeof value === "object") {
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
          javaPojo += `${getList(depth, "Boolean")} ${lowerCaseFirst(
            key
          )};\n\n`;
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
const generateClass = (className, json) => {
  const javaPojo = generatePojo(json);
  const javaClass = `public class ${className} {\n\n${javaPojo}}`;
  classes.push(javaClass);
};

const generateJavaPojo = (className, jsonInput) => {
  let json = validateJson(jsonInput);
  if (json === null) {
    console.log("Invalid Json");
  } else {
    generateClass(className, json);
  }
};

const jsonString = JSON.stringify(input);
generateJavaPojo("MatchJson", jsonString);
let output = "";
classes.forEach((element) => {
  output += `${element}\n\n`;
});

fs.writeFile(`MatchJson.java`, output, (err) => {
  if (err) throw err;
  console.log("Saved!");
});
