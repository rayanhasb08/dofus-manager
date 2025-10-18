/**
 * Helpers pour charger et manipuler les templates HTML
 */

/**
 * Charge un template HTML et remplace les variables
 */
export function loadTemplate(template: string, variables: Record<string, any> = {}): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }
  
  return result;
}

/**
 * Répète un template HTML n fois
 */
export function repeatTemplate(template: string, count: number, mapFn?: (index: number) => Record<string, any>): string {
  let result = '';
  for (let i = 0; i < count; i++) {
    const variables = mapFn ? mapFn(i) : {};
    result += loadTemplate(template, variables);
  }
  return result;
}