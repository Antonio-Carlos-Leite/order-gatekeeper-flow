import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Upload, Save, Image as ImageIcon, PenTool } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AuthUserInfo } from '@/hooks/useAuth';

interface EmpresaConfigProps {
  userInfo: AuthUserInfo;
  onSaved?: () => void;
}

const EmpresaConfig = ({ userInfo, onSaved }: EmpresaConfigProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'assinatura' | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState({
    nome: '',
    cidade: '',
    estado: '',
    codigo_acesso: '',
    logo_url: '',
    assinatura_url: '',
    responsavel_nome: '',
    responsavel_cargo: '',
  });

  useEffect(() => {
    (async () => {
      const { data: empresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', userInfo.empresaId)
        .maybeSingle();
      if (empresa) {
        setData({
          nome: empresa.nome || '',
          cidade: (empresa as any).cidade || '',
          estado: (empresa as any).estado || '',
          codigo_acesso: empresa.codigo_acesso || '',
          logo_url: (empresa as any).logo_url || '',
          assinatura_url: (empresa as any).assinatura_url || '',
          responsavel_nome: (empresa as any).responsavel_nome || '',
          responsavel_cargo: (empresa as any).responsavel_cargo || '',
        });
      }
    })();
  }, [userInfo.empresaId]);

  const handleUpload = async (file: File, type: 'logo' | 'assinatura') => {
    setUploading(type);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userInfo.empresaId}/${type}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('empresa-assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('empresa-assets').getPublicUrl(path);
      setData(prev => ({ ...prev, [type === 'logo' ? 'logo_url' : 'assinatura_url']: pub.publicUrl }));
      toast({ title: 'Upload concluído', description: `${type === 'logo' ? 'Logo' : 'Assinatura'} enviada com sucesso.` });
    } catch (err: any) {
      toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          nome: data.nome,
          cidade: data.cidade,
          estado: data.estado,
          logo_url: data.logo_url,
          assinatura_url: data.assinatura_url,
          responsavel_nome: data.responsavel_nome,
          responsavel_cargo: data.responsavel_cargo,
        } as any)
        .eq('id', userInfo.empresaId);
      if (error) throw error;
      toast({ title: 'Salvo!', description: 'Configurações da empresa atualizadas.' });
      onSaved?.();
      window.location.reload();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Configurações da Empresa
        </CardTitle>
        <CardDescription>
          Personalize a identidade visual usada nas Ordens de Serviço e documentos impressos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome da Empresa / Prefeitura *</Label>
            <Input value={data.nome} onChange={e => setData({ ...data, nome: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Código de Acesso</Label>
            <Input value={data.codigo_acesso} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={data.cidade} onChange={e => setData({ ...data, cidade: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Estado (UF)</Label>
            <Input maxLength={2} value={data.estado} onChange={e => setData({ ...data, estado: e.target.value.toUpperCase() })} placeholder="Ex.: SP" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome do Responsável</Label>
            <Input value={data.responsavel_nome} onChange={e => setData({ ...data, responsavel_nome: e.target.value })} placeholder="Ex.: João da Silva" />
          </div>
          <div className="space-y-2">
            <Label>Cargo do Responsável</Label>
            <Input value={data.responsavel_cargo} onChange={e => setData({ ...data, responsavel_cargo: e.target.value })} placeholder="Ex.: Prefeito Municipal" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Logo da Empresa/Prefeitura</Label>
            <div className="border-2 border-dashed rounded p-3 flex items-center gap-3">
              {data.logo_url ? (
                <img src={data.logo_url} alt="Logo" className="h-16 w-16 object-contain bg-white rounded" />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-muted rounded text-muted-foreground"><ImageIcon className="w-6 h-6" /></div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploading === 'logo'}>
                <Upload className="w-3 h-3 mr-1" />
                {uploading === 'logo' ? 'Enviando...' : 'Enviar Logo'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><PenTool className="w-4 h-4" /> Assinatura do Responsável</Label>
            <div className="border-2 border-dashed rounded p-3 flex items-center gap-3">
              {data.assinatura_url ? (
                <img src={data.assinatura_url} alt="Assinatura" className="h-16 w-32 object-contain bg-white rounded" />
              ) : (
                <div className="h-16 w-32 flex items-center justify-center bg-muted rounded text-muted-foreground"><PenTool className="w-6 h-6" /></div>
              )}
              <input
                ref={sigInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'assinatura')}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => sigInputRef.current?.click()} disabled={uploading === 'assinatura'}>
                <Upload className="w-3 h-3 mr-1" />
                {uploading === 'assinatura' ? 'Enviando...' : 'Enviar Assinatura'}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Dica: use uma imagem PNG com fundo transparente para melhor resultado na O.S.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="w-4 h-4" /> {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmpresaConfig;
