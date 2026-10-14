@Injectable()
export class DevedorService {
  constructor(
      @InjectRepository(DevedorEntity)
          private readonly devedorRepository: Repository<DevedorEntity>,

              @InjectRepository(FaturasEntity)
                  private readonly faturasRepository: Repository<FaturasEntity>,
                    ) {}

                      async sincronizarDevedores() {
                          const faturas = await this.faturasRepository.find();

                              const grupos = new Map<string, FaturasEntity[]>();

                                  for (const fatura of faturas) {
                                        const cpf = fatura.cpfDevedor;

                                              if (!cpf) continue;

                                                    const grupo = grupos.get(cpf) ?? [];
                                                          grupo.push(fatura);
                                                                grupos.set(cpf, grupo);
                                                                    }

                                                                        for (const [cpf, faturasDevedor] of grupos) {
                                                                              const total = faturasDevedor.reduce(
                                                                                      (soma, fatura) => soma + Number(fatura.valor),
                                                                                              0,
                                                                                                    );

                                                                                                          const existente = await this.devedorRepository.findOneBy({
                                                                                                                  cpf,
                                                                                                                        });

                                                                                                                              if (!existente) {
                                                                                                                                      const devedor = this.devedorRepository.create({
                                                                                                                                                cpf,
                                                                                                                                                          nome: faturasDevedor[0].nomeDevedor,
                                                                                                                                                                    codigo: cpf,
                                                                                                                                                                              saldoDevedor: total,
                                                                                                                                                                                      });

                                                                                                                                                                                              await this.devedorRepository.save(devedor);
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                            existente.saldoDevedor = total;
                                                                                                                                                                                                                    await this.devedorRepository.save(existente);
                                                                                                                                                                                                                          }
                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                }