export class UpdateUserDto {
  // O '?' torna o campo opcional, pois o utilizador pode querer
  // atualizar apenas a foto, ou apenas outros campos no futuro.
  profileImageUrl?: string;
}