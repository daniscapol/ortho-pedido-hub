import { SupportChatAdmin } from '@/components/admin/SupportChatAdmin';

export default function SupportAdmin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Suporte - Admin</h1>
        <p className="text-muted-foreground">
          Gerencie as conversas de suporte com os dentistas
        </p>
      </div>
      
      <SupportChatAdmin />
    </div>
  );
}