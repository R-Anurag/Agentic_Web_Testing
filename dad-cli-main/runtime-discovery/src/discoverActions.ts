import { Page } from "playwright";

export type DiscoveredAction = {
  id: string;
  type: "button" | "link" | "input" | "select" | "checkbox" | "radio";
  label: string;
  viewportSafe: boolean;
  inputType?: string;
  options?: string[];
};

export async function discoverActions(page: Page): Promise<DiscoveredAction[]> {
  try {
    const actions = await page.evaluate(() => {
      const results = [];

      // Find buttons
      const buttons = document.querySelectorAll('button');
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        const text = btn.textContent?.trim();
        if (text && text.length > 1) {
          const rect = btn.getBoundingClientRect();
          const visible = rect.top >= 0 && rect.left >= 0 && 
                         rect.bottom <= window.innerHeight && 
                         rect.right <= window.innerWidth;
          
          results.push({
            id: 'button_' + text.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            type: 'button',
            label: text,
            viewportSafe: visible
          });
        }
      }

      // Find links
      const links = document.querySelectorAll('a[href]');
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const text = link.textContent?.trim();
        if (text && text.length > 1) {
          const rect = link.getBoundingClientRect();
          const visible = rect.top >= 0 && rect.left >= 0 && 
                         rect.bottom <= window.innerHeight && 
                         rect.right <= window.innerWidth;
          
          results.push({
            id: 'link_' + text.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            type: 'link',
            label: text,
            viewportSafe: visible
          });
        }
      }

      // Find inputs
      const inputs = document.querySelectorAll('input, textarea');
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const type = input.type || 'text';
        const placeholder = input.placeholder || input.name || `input_${i}`;
        const rect = input.getBoundingClientRect();
        const visible = rect.top >= 0 && rect.left >= 0 && 
                       rect.bottom <= window.innerHeight && 
                       rect.right <= window.innerWidth;
        
        if (type === 'checkbox' || type === 'radio') {
          results.push({
            id: `${type}_${placeholder.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
            type: type,
            label: placeholder,
            viewportSafe: visible,
            inputType: type
          });
        } else if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
          results.push({
            id: `input_${placeholder.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
            type: 'input',
            label: placeholder,
            viewportSafe: visible,
            inputType: type
          });
        }
      }

      // Find selects
      const selects = document.querySelectorAll('select');
      for (let i = 0; i < selects.length; i++) {
        const select = selects[i];
        const name = select.name || `select_${i}`;
        const options = Array.from(select.options).map(opt => opt.text);
        const rect = select.getBoundingClientRect();
        const visible = rect.top >= 0 && rect.left >= 0 && 
                       rect.bottom <= window.innerHeight && 
                       rect.right <= window.innerWidth;
        
        results.push({
          id: `select_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
          type: 'select',
          label: name,
          viewportSafe: visible,
          options: options
        });
      }

      return results;
    });

    return actions as DiscoveredAction[];
  } catch (error) {
    console.error('❌ Action discovery failed:', error);
    return [];
  }
}
