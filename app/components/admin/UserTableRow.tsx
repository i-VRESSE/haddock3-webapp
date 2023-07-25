import type { User } from "~/models/user.server";

interface IProps {
  user: User;
  roles: string[];
  onUpdate: (data: FormData) => void;
  submitting: boolean;
}

export const UserTableRow = ({ user, roles, onUpdate, submitting }: IProps) => {
  const userRoles = user.roles.map((r) => r.name);
  return (
    <tr>
      <td>{user.email}</td>
      <td>
        <ul className="flex">
          {roles.map((role) => {
            return (
              <li key={role}>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{role}</span>
                    <input
                      type="checkbox"
                      checked={userRoles.includes(role)}
                      className="checkbox ml-2"
                      disabled={submitting}
                      onChange={() => {
                        const data = new FormData();
                        data.set(
                          role,
                          userRoles.includes(role) ? "false" : "true"
                        );
                        onUpdate(data);
                      }}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </td>
    </tr>
  );
};
