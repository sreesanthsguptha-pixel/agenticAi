const BaseIntegration = require('./baseIntegration');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  async executeAction(actionName, params = {}, credentials = null) {
    if (actionName === 'append_row') {
      const { spreadsheetId = 'sheet_123', sheetName = 'Sheet1', values = ['Sample', 'Data', new Date().toISOString()] } = params;
      return {
        success: true,
        provider: 'google-sheets',
        action: 'append_row',
        spreadsheetId,
        sheetName,
        updatedRows: 1,
        appendedValues: values,
        timestamp: new Date().toISOString()
      };
    } else if (actionName === 'read_range') {
      return {
        success: true,
        provider: 'google-sheets',
        action: 'read_range',
        rows: [
          ['Header 1', 'Header 2', 'Header 3'],
          ['Val 1', 'Val 2', 'Val 3']
        ]
      };
    }
    throw new Error(`Unsupported Google Sheets action: ${actionName}`);
  }
}

module.exports = new GoogleSheetsIntegration();
