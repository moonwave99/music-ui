import { Tabs, Pre, Code } from "nextra/components";

const packageManagers = [
  { name: "pnpm", command: "pnpm add" },
  { name: "npm", command: "npm install" },
  { name: "yarn", command: "yarn add" },
];

type InstallationProps = {
  packageName: string;
};

export function Installation({ packageName }: InstallationProps) {
  return (
    <Tabs items={packageManagers.map((x) => x.name)}>
      {packageManagers.map(({ name, command }) => (
        <Tabs.Tab key={name}>
          <Pre>
            <Code>
              <span>
                {command} {packageName}
              </span>
            </Code>
          </Pre>
        </Tabs.Tab>
      ))}
    </Tabs>
  );
}
