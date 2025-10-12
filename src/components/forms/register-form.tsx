import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface RegisterFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = React.useState({
    entityType: "INDIVIDUAL" as "INDIVIDUAL" | "COMPANY",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
    registrationNumber: "",
    taxId: "",
    role: "" as
      | "PRODUCER"
      | "CONSUMER"
      | "STORAGE_OWNER"
      | "TRANSPORTER"
      | "TRANSFORMER",
    phoneNumber: "",
  });
  const [formError, setFormError] = React.useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value as any }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setFormError("Todos os campos obrigatórios devem ser preenchidos");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("As senhas não coincidem");
      return;
    }
    if (formData.password.length < 8) {
      setFormError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    // Additional validation: require fullName for INDIVIDUAL, companyName+registrationNumber+taxId for COMPANY
    if (formData.entityType === "INDIVIDUAL" && !formData.fullName) {
      setFormError("Nome completo é obrigatório para indivíduos");
      return;
    }
    if (
      formData.entityType === "COMPANY" &&
      (!formData.companyName || !formData.registrationNumber || !formData.taxId)
    ) {
      setFormError("Informações da empresa são obrigatórias");
      return;
    }

    onSubmit(formData);
  }

  const roleOptions = [
    { value: "PRODUCER", label: "Produtor (Agricultor/Pecuarista)" },
    { value: "CONSUMER", label: "Consumidor (Comprador)" },
    { value: "STORAGE_OWNER", label: "Proprietário de Armazém" },
    { value: "TRANSPORTER", label: "Transportador" },
    { value: "TRANSFORMER", label: "Transformador (Processamento)" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Criar Conta
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Junte-se à plataforma AgriLogística Angola
          </p>
        </div>

        {(error || formError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 text-sm">{error || formError}</p>
          </div>
        )}

        {/* Entity Type Selector */}
        <Select
          id="entityType"
          label="Tipo de Entidade"
          options={[
            { value: "INDIVIDUAL", label: "Pessoa Física" },
            { value: "COMPANY", label: "Empresa" },
          ]}
          value={formData.entityType}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="username"
            label="Nome de usuário"
            value={formData.username}
            onChange={handleChange}
            placeholder="seu_usuario"
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu.email@exemplo.com"
            required
          />

          {formData.entityType === "INDIVIDUAL" ? (
            <Input
              id="fullName"
              label="Nome completo"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Seu Nome Completo"
              required
            />
          ) : (
            <>
              <Input
                id="companyName"
                label="Nome da Empresa"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Ex: AgroFarms Lda"
                required
              />
              <Input
                id="registrationNumber"
                label="Número de Registro"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="REG-XXXX"
                required
              />
              <Input
                id="taxId"
                label="NIF / Tax ID"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="TIN-XXXX"
                required
              />
            </>
          )}

          <Input
            id="phoneNumber"
            label="Número de telefone"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+244 XXX XXX XXX"
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
            helperText="Mínimo de 8 caracteres"
          />
          <Input
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="********"
            required
          />
        </div>

        <Select
          id="role"
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
            Eu concordo com os{" "}
            <a
              href="/terms"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a
              href="/privacy"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Política de Privacidade
            </a>
          </label>
        </div>

        <Button type="submit" variant="default" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar"}
        </Button>
      </form>
    </Card>
  );
};

export default RegisterForm;
