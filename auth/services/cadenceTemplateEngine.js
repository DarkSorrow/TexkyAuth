export const generateTemplate = function(templatePath, replaceMapping) {
    let template = import(templatePath)
    for (const key in replaceMapping) {
        template = template.replace(`{{${key}}}`, replaceMapping[key])
    }
    return template;
}