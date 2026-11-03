import { AppError } from '../../shared/errors/AppError';
import { findActiveEstablishmentById } from './establishments.repository';
import { CategoryRow, EstablishmentDetails, EstablishmentRow } from './establishments.types';
import { parseEstablishmentId } from './establishments.validation';

function toDetails(row: EstablishmentRow): EstablishmentDetails {
  const categories = (row.establishment_categories ?? [])
    .map((item) => item.categories)
    .filter((category): category is CategoryRow => category !== null)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      group: category.category_group,
    }));

  const photos = [...(row.establishment_photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((photo) => ({
      id: photo.id,
      url: photo.url,
      alt: photo.alt,
      isCover: photo.is_cover,
    }));

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    address: {
      street: row.street,
      number: row.number,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
    },
    latitude: row.latitude,
    longitude: row.longitude,
    contact: {
      phone: row.phone,
      whatsapp: row.whatsapp,
      email: row.email,
      website: row.website,
    },
    socialLinks: row.social_links ?? {},
    openingHours: row.opening_hours ?? null,
    priceRange: row.price_range,
    categories,
    photos,
  };
}

export async function getEstablishmentDetails(idParam: unknown): Promise<EstablishmentDetails> {
  const id = parseEstablishmentId(idParam);
  const row = await findActiveEstablishmentById(id);

  if (!row) {
    throw new AppError('Estabelecimento não encontrado.', 404, 'ESTABLISHMENT_NOT_FOUND');
  }

  return toDetails(row);
}