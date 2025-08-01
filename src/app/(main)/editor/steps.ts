import { EditorFormProps } from "@/lib/types";
import EducationForm from "./forms/EducationForm";
import GeneralInfoForm from "./forms/GeneralInfoForm";
import PersonalInfoForm from "./forms/PersonalInfoForm";
import SkillsForm from "./forms/SkillsForm";
import SummaryForm from "./forms/SummaryForm";
import WorkExperienceForm from "./forms/WorkExperienceForm";
import CustomSectionsForm from "./forms/CustomSectionsForm";

export const steps: {
  title: string;
  component: React.ComponentType<EditorFormProps>;
  key: string;
}[] = [
  { title: "Informações gerais", component: GeneralInfoForm, key: "general-info" },
  { title: "Informações pessoais", component: PersonalInfoForm, key: "personal-info" },
  {
    title: "Experiência profissional",
    component: WorkExperienceForm,
    key: "work-experience",
  },
  { title: "Educação", component: EducationForm, key: "education" },
  { title: "Habilidades", component: SkillsForm, key: "skills" },
  {
    title: "Perfil profissional",
    component: SummaryForm,
    key: "summary",
  },
  {
    title: "Seções adicionais",
    component: CustomSectionsForm,
    key: "custom-sections",
  },
];
