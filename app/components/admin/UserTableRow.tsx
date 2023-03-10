import type { UserAsListItem } from "~/bartender-client";

interface IProps {
  user: UserAsListItem;
  roles: string[];
  onUpdate: (data: FormData) => void;
}

export const UserTableRow = ({ user, roles, onUpdate }: IProps) => {
  return (
    <tr>
      <td>{user.email}</td>
      <td>
        
        <input
          type="checkbox"
          checked={user.isSuperuser}
          className="checkbox"
          onChange={() => {
            const data = new FormData();
            data.set("isSuperuser", user.isSuperuser ? "false" : "true");
            onUpdate(data);
          }}
        />
      </td>
      <td>
        <ul>
          {roles.map((role) => {
            return (
              <li key={role}>
                <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{role}</span> 
                  <input
                    type="checkbox"
                    checked={role in user.roles}
                    className="checkbox"
                    onChange={() => {
                      const data = new FormData();
                      data.set(
                        `role:${role}`,
                        role in user.roles ? "false" : "true"
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
