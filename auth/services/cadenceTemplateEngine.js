export const generateTemplate = function(template, replaceMapping) {
    for (const key in replaceMapping) {
        template = template.replace(`{{${key}}}`, replaceMapping[key])
    }
    return template;
}