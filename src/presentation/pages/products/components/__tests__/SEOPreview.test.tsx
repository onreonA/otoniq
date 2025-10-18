import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SEOPreview from '../SEOPreview';

describe('SEOPreview', () => {
  const defaultProps = {
    title: 'Test Product Title',
    description:
      'This is a test product description that is long enough to test the SEO preview functionality.',
    keywords: ['test', 'product', 'seo', 'keywords'],
  };

  it('renders preview toggle button', () => {
    render(<SEOPreview {...defaultProps} />);

    expect(screen.getByText('SEO Önizleme')).toBeInTheDocument();
    expect(screen.getByText('Önizle')).toBeInTheDocument();
  });

  it('toggles preview visibility', () => {
    render(<SEOPreview {...defaultProps} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(
      screen.getByText('Google Arama Sonucu Önizlemesi')
    ).toBeInTheDocument();
    expect(screen.getByText('Gizle')).toBeInTheDocument();
  });

  it('shows Google search result preview', () => {
    render(<SEOPreview {...defaultProps} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(
      screen.getByText('https://otoniq.ai/urunler/test-product-title')
    ).toBeInTheDocument();
    expect(screen.getByText('Test Product Title')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is a test product description that is long enough to test the SEO preview functionality.'
      )
    ).toBeInTheDocument();
  });

  it('displays keywords correctly', () => {
    render(<SEOPreview {...defaultProps} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('product')).toBeInTheDocument();
    expect(screen.getByText('seo')).toBeInTheDocument();
    expect(screen.getByText('keywords')).toBeInTheDocument();
  });

  it('shows SEO analysis correctly', () => {
    render(<SEOPreview {...defaultProps} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(screen.getByText('SEO Analizi')).toBeInTheDocument();
    expect(screen.getByText('Başlık Uzunluğu')).toBeInTheDocument();
    expect(screen.getByText('Açıklama Uzunluğu')).toBeInTheDocument();
    expect(screen.getByText('Anahtar Kelimeler')).toBeInTheDocument();
    expect(screen.getByText('Genel Skor')).toBeInTheDocument();
  });

  it('shows SEO tips', () => {
    render(<SEOPreview {...defaultProps} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(screen.getByText('SEO İpuçları')).toBeInTheDocument();
    expect(
      screen.getByText('• Başlık 30-60 karakter arasında olmalı')
    ).toBeInTheDocument();
    expect(
      screen.getByText('• Açıklama 120-160 karakter arasında olmalı')
    ).toBeInTheDocument();
  });

  it('handles empty title and description', () => {
    render(<SEOPreview title='' description='' keywords={[]} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Ürün Başlığı')).toBeInTheDocument();
    expect(
      screen.getByText('Ürün açıklaması burada görünecek...')
    ).toBeInTheDocument();
  });

  it('calculates title length correctly', () => {
    const longTitle =
      'This is a very long title that exceeds the recommended 60 character limit for SEO purposes';
    render(<SEOPreview {...defaultProps} title={longTitle} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(screen.getByText(`${longTitle.length}/60`)).toBeInTheDocument();
  });

  it('calculates description length correctly', () => {
    const longDescription =
      'This is a very long description that exceeds the recommended 160 character limit for SEO purposes and should trigger a warning in the SEO analysis';
    render(<SEOPreview {...defaultProps} description={longDescription} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(
      screen.getByText(`${longDescription.length}/160`)
    ).toBeInTheDocument();
  });

  it('shows keyword count correctly', () => {
    const manyKeywords = [
      'keyword1',
      'keyword2',
      'keyword3',
      'keyword4',
      'keyword5',
      'keyword6',
      'keyword7',
      'keyword8',
      'keyword9',
      'keyword10',
      'keyword11',
    ];
    render(<SEOPreview {...defaultProps} keywords={manyKeywords} />);

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    expect(screen.getByText(`${manyKeywords.length}/10`)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SEOPreview {...defaultProps} className='custom-class' />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows different scores for different content lengths', () => {
    const shortTitle = 'Short';
    const shortDescription = 'Short desc';
    const fewKeywords = ['test'];

    render(
      <SEOPreview
        title={shortTitle}
        description={shortDescription}
        keywords={fewKeywords}
      />
    );

    const toggleButton = screen.getByText('Önizle');
    fireEvent.click(toggleButton);

    // Should show different scores for short content
    expect(screen.getByText(`${shortTitle.length}/60`)).toBeInTheDocument();
    expect(
      screen.getByText(`${shortDescription.length}/160`)
    ).toBeInTheDocument();
    expect(screen.getByText(`${fewKeywords.length}/10`)).toBeInTheDocument();
  });
});
