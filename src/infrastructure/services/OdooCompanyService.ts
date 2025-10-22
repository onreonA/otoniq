/**
 * Odoo Company Service
 *
 * Odoo company seçeneklerini yönetir ve company ID'leri ile eşleştirir
 */

export interface OdooCompanyOption {
  id: number;
  name: string;
  description: string;
}

export class OdooCompanyService {
  /**
   * Mevcut Odoo company seçeneklerini getir
   */
  static getCompanyOptions(): OdooCompanyOption[] {
    return [
      {
        id: 1,
        name: 'NSL Savunma Ve Bilişim AŞ',
        description: 'NSL Savunma Ve Bilişim Sanayi Ve Ticaret Anonim Şirketi',
      },
      {
        id: 2,
        name: 'Woodntry E-ticaret Pazarlama AŞ',
        description: 'Woodntry Mobilya E-ticaret Pazarlama Anonim Şirketi',
      },
    ];
  }

  /**
   * Company ID'ye göre company bilgilerini getir
   */
  static getCompanyById(id: number): OdooCompanyOption | null {
    const options = this.getCompanyOptions();
    return options.find(option => option.id === id) || null;
  }

  /**
   * Company name'e göre company bilgilerini getir
   */
  static getCompanyByName(name: string): OdooCompanyOption | null {
    const options = this.getCompanyOptions();
    return (
      options.find(
        option =>
          option.name.toLowerCase().includes(name.toLowerCase()) ||
          option.description.toLowerCase().includes(name.toLowerCase())
      ) || null
    );
  }

  /**
   * Company seçeneklerini dropdown için formatla
   */
  static getFormattedOptions(): Array<{
    value: number;
    label: string;
    description: string;
  }> {
    return this.getCompanyOptions().map(option => ({
      value: option.id,
      label: option.name,
      description: option.description,
    }));
  }
}
