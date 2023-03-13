import type { UserAsListItem } from "~/bartender-client";

interface IProps {
  user: UserAsListItem;
  roles: string[];
  onUpdate: (data: FormData) => void;
  submitting: boolean;
}

export const UserTableRow = ({ user, roles, onUpdate, submitting }: IProps) => {
  return (
    <tr>
      <td>{user.email}</td>
      <td>
        
        <input
          type="checkbox"
          checked={user.isSuperuser}
          className="checkbox"
          disabled={submitting}
          onChange={() => {
            const data = new FormData();
            data.set("isSuperuser", user.isSuperuser ? "false" : "true");
            onUpdate(data);
          }}
        />
      </td>
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
                    checked={user.roles.includes(role)}
                    className="checkbox ml-2"
                    disabled={submitting}
                    onChange={() => {
                      const data = new FormData();
                      data.set(
                        role,
                        user.roles.includes(role) ? "false" : "true"
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
