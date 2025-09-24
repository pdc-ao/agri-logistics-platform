import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface RegisterFormProps {
  onSubmit: (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    role: 'PRODUCER' | 'CONSUMER' | 'STORAGE_OWNER' | 'TRANSPORTER';
    phoneNumber?: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: '' as 'PRODUCER' | 'CONSUMER' | 'STORAGE_OWNER' | 'TRANSPORTER',
    phoneNumber: '',
  });
  const [formError, setFormError] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validação básica
    if (!formData.username || !formData.email || !formData.password || !formData.fullName || !formData.role) {
      setFormError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    onSubmit(formData);
  };

  const roleOptions = [
    { value: 'PRODUCER', label: 'Produtor (Agricultor/Pecuarista)' },
    { value: 'CONSUMER', label: 'Consumidor (Comprador)' },
    { value: 'STORAGE_OWNER', label: 'Proprietário de Armazém' },
    { value: 'TRANSPORTER', label: 'Transportador' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800">Criar Conta</h2>
          <p className="mt-2 text-center text-gray-600">
            Junte-se à plataforma AgriLogística Angola
          </p>
        </div>

        {(error || formError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || formError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="username"
            name="username"
            label="Nome de usuário"
            type="text"
            placeholder="seu_usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            id="fullName"
            name="fullName"
            label="Nome completo"
            type="text"
            placeholder="Seu Nome Completo"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <Input
            id="phoneNumber"
            name="phoneNumber"
            label="Número de telefone"
            type="tel"
            placeholder="+244 XXX XXX XXX"
            value={formData.phoneNumber}
            onChange={handleChange}
          />

          <Input
            id="password"
            name="password"
            label="Senha"
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            required
            helperText="Mínimo de 8 caracteres"
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="********"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <Select
          id="role"
          name="role"
          label="Tipo de usuário"
          options={roleOptions}
          value={formData.role}
          onChange={handleChange}
          placeholder="Selecione seu tipo de usuário"
          required
        />

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            Eu concordo com os{' '}
            <a href="/terms" className="font-medium text-green-600 hover:text-green-500">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="/privacy" className="font-medium text-green-600 hover:text-green-500">
              Política de Privacidade
            </a>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrar'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <a href="/login" className="font-medium text-green-600 hover:text-green-500">
              Entrar
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
};

export default RegisterForm;