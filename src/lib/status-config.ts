export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export const MASTER_STATUS_OPTIONS: StatusOption[] = [
  { value: 'pedido_solicitado', label: 'Pedido Solicitado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'baixado_verificado', label: 'Baixado e verificado', color: 'bg-blue-100 text-blue-800' },
  { value: 'projeto_realizado', label: 'Projeto Realizado', color: 'bg-purple-100 text-purple-800' },
  { value: 'projeto_modelo_realizado', label: 'Projeto do modelo Realizado', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'aguardando_entrega', label: 'Aguardando entrega', color: 'bg-orange-100 text-orange-800' },
  { value: 'entregue', label: 'Entregue', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

export const DENTIST_STATUS_OPTIONS: StatusOption[] = [
  { value: 'pedido_solicitado', label: 'Pedido Solicitado', color: 'bg-yellow-100 text-yellow-800' }
];

// Função para obter status baseado no papel do usuário
export const getStatusOptions = (isAdminMaster: boolean): StatusOption[] => {
  return isAdminMaster ? MASTER_STATUS_OPTIONS : DENTIST_STATUS_OPTIONS;
};

// Função para obter a cor do status
export const getStatusColor = (status: string): string => {
  const allStatuses = [...MASTER_STATUS_OPTIONS];
  const statusOption = allStatuses.find(s => s.value === status);
  return statusOption?.color || 'bg-gray-100 text-gray-800';
};

// Função para obter o label do status
export const getStatusLabel = (status: string, isAdminMaster: boolean = false): string => {
  // Se não é admin master, sempre mostrar "Pedido Solicitado"
  if (!isAdminMaster) {
    return 'Pedido Solicitado';
  }
  
  const allStatuses = [...MASTER_STATUS_OPTIONS];
  const statusOption = allStatuses.find(s => s.value === status);
  return statusOption?.label || 'Desconhecido';
};

// Função para verificar se um status pode ser alterado pelo usuário
export const canChangeStatus = (isAdminMaster: boolean): boolean => {
  return isAdminMaster;
};